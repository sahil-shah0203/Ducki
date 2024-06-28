import { useState, useEffect, useRef } from 'react';
import { api } from "~/trpc/react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown, { Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css'; // Import a highlight.js CSS style for code blocks
import { CSSProperties } from 'react';

interface LLMInputProps {
  onFetchResults: (choices: any[]) => void;
  onError: (error: string | null) => void;
  user_id: number | undefined;
  selectedClassName: string | null;
  selectedClassID: number | null;
}

interface ChatMessage {
  type: boolean;
  text: string;
  session: string;
  timestamp: Date;
}

export default function LLMInput({ onFetchResults, onError, user_id, selectedClassName, selectedClassID }: LLMInputProps) {
  const [inputText, setInputText] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [displayResponse, setDisplayResponse] = useState<string>("");
  const [completedTyping, setCompletedTyping] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const abortController = useRef(new AbortController());
  const inputRef = useRef<HTMLInputElement>(null);
  const [lastMessage, setLastMessage] = useState<ChatMessage | null>(null);
  const sessionId = useRef(Date.now().toString());
  const storeChatHistoryMutation = api.chats.storeChatHistory.useMutation();

  const chatHistoryQuery = typeof user_id === 'number' && typeof selectedClassID === 'number'
    ? api.chats.getChatHistory.useQuery({ user_id: user_id, class_id: selectedClassID })
    : undefined;

  const CodeBlock = ({ language, value }: { language: string; value: string }) => {
    return <SyntaxHighlighter style={solarizedlight} language={language}>{value}</SyntaxHighlighter>;
  };

  const components: Components = {
    code({ node, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className ?? '')
      return match
        ? <SyntaxHighlighter style={solarizedlight as CSSProperties} language={match[1]} PreTag="div" {...props}>{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
        : <code className={className} {...props}>{children}</code>
    },
    ul({ children }) {
      return <ul className="list-disc ml-5">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="list-decimal ml-5">{children}</ol>;
    },
    li({ children }) {
      return <li className="mb-1">{children}</li>;
    },
    math({ value }) {
      return <span className="katex-display">{value}</span>;
    },
    inlineMath({ value }) {
      return <span className="katex-inline">{value}</span>;
    }
  };

  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (chatHistoryQuery && chatHistoryQuery.data) {
      const storedChatMessages = chatHistoryQuery.data as { content: string, sentByUser: boolean, timestamp: Date }[];
      const chatMessages: ChatMessage[] = storedChatMessages.map(message => ({
        type: message.sentByUser,
        text: message.content,
        session: sessionId.current,
        timestamp: new Date(message.timestamp),
      }));
      setChatMessages(chatMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).reverse());
    }
  }, [chatHistoryQuery?.data]);

  useEffect(() => {
    if (!completedTyping && chatMessages.length > 0 && chatMessages[0]?.type === false) {
      let i = 0;
      const stringResponse = chatMessages[0].text;
      const charactersPerInterval = 3; // Number of characters to display per interval
      const intervalId = setInterval(() => {
        setDisplayResponse(stringResponse.slice(0, i));
        i += charactersPerInterval;
        if (i > stringResponse.length) {
          clearInterval(intervalId);
          setCompletedTyping(true);
          inputRef.current?.focus();
        }
      }, 20); // Adjust interval duration as needed
      return () => clearInterval(intervalId);
    }
  }, [chatMessages, completedTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const getPreciseTimestamp = () => {
    const timeOrigin = performance.timeOrigin;
    const now = performance.now();
    return new Date(timeOrigin + now);
  };

  const storeChatHistory = (message: ChatMessage, isUserMessage: boolean) => {
    if (typeof user_id === 'number' && typeof selectedClassID === 'number') {
      storeChatHistoryMutation.mutate({
        user_id: user_id,
        class_id: selectedClassID,
        content: message.text,
        sentByUser: isUserMessage,
        timestamp: message.timestamp.toISOString(),
      });
    }
  };

  const fetchAndStoreChatHistory = async (inputText: string, userMessage: ChatMessage) => {
    setLoading(true);
    abortController.current = new AbortController();
    try {
      const response = await fetch("/api/LLM", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: inputText }),
        signal: abortController.current.signal,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const llmMessage = result.choices[0].message.content;
      const llmTimestamp = getPreciseTimestamp();
      const llmResponseMessage: ChatMessage = { type: false, text: llmMessage, session: sessionId.current, timestamp: llmTimestamp };
      setChatMessages(prevMessages => [...prevMessages, llmResponseMessage].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).reverse());
      setLastMessage(llmResponseMessage);
      setCompletedTyping(false);
      setIsGenerating(false);
      storeChatHistory(llmResponseMessage, false);
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error("Error fetching data:", err);
        onError("Failed to fetch response from the server.");
      }
      setIsGenerating(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    onError(null);
    const userTimestamp = getPreciseTimestamp();
    const userMessage: ChatMessage = { type: true, text: inputText, session: sessionId.current, timestamp: userTimestamp };
    setChatMessages(prevMessages => [...prevMessages, userMessage].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).reverse());
    setInputText('');
    storeChatHistory(userMessage, true);
    setTimeout(() => {
      fetchAndStoreChatHistory(inputText, userMessage);
    }, 1000);
  };

  const handleStopGeneration = () => {
    abortController.current.abort();
    setDisplayResponse('<span class="generation-stopped">Response generation stopped</span>');
    const stopTimestamp = getPreciseTimestamp();
    setChatMessages(prevMessages => [...prevMessages, { type: false, text: '<span class="generation-stopped">Response generation stopped</span>', session: sessionId.current, timestamp: stopTimestamp }].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).reverse());
    setIsGenerating(false);
    setCompletedTyping(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputText !== '') {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div id="chat-container" className="overflow-auto rounded p-0 flex space-y-2 flex-grow">
        {loading && (
          <div className="p-2 rounded-lg my-2 max-w-sm text-sm bg-gray-300 text-white self-start animate-pulse">
            Loading...
          </div>
        )}
        {chatMessages.map((message, index) => (
          <div key={index} className={`p-2 rounded-lg my-2 max-w-sm text-sm ${message.type ? 'bg-blue-500 text-white self-end' : message.text.includes('generation-stopped') ? '' : 'bg-green-500 text-white self-start'}`}>
            {index === 0 && !message.type && message.session === sessionId.current && !completedTyping ? (
              <ReactMarkdown components={components} rehypePlugins={[rehypeRaw, rehypeKatex]} remarkPlugins={[remarkMath]}>
                {displayResponse + (!completedTyping ? '<span class="cursor"></span>' : '')}
              </ReactMarkdown>
            ) : (
              <ReactMarkdown components={components} rehypePlugins={[rehypeRaw, rehypeKatex]} remarkPlugins={[remarkMath]}>
                {message.text}
              </ReactMarkdown>
            )}
          </div>
        ))}
      </div>
      <div className="w-full flex items-center bg-transparent p-12 border-12 mb-12">
        <input
          ref={inputRef}
          type="text"
          className="border rounded py-1 px-2 flex-grow text-black text-sm"
          value={inputText}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter text for LLM"
          aria-label="Text input for LLM prompt"
          disabled={isGenerating}
        />
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded ml-2"
          onClick={isGenerating ? handleStopGeneration : handleSubmit}
          aria-label={isGenerating ? "Stop Generation" : "Submit prompt to LLM"}
        >
          {isGenerating ? "Stop Generation" : "Submit"}
        </button>
      </div>
    </div>
  );
}
