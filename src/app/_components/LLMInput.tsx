import { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { api } from "~/trpc/react";
import 'katex/dist/katex.min.css';
import katex from 'katex';

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

const formatText = (text: string): string => {
  console.log("Formatting text:", text);

  // Save LaTeX sections
  const latexSections: Record<string, string> = {};
  let sectionIndex = 0;
  // Detect LaTeX sections by identifying common mathematical patterns or keywords
  const latexRegex = /([A-Za-z0-9]+(?:\s*[\+\-\*\/\^]\s*[A-Za-z0-9]+)+|\\(?:frac|sqrt|sum|int|lim|sin|cos|tan|log|exp|pi|theta|alpha|beta|gamma|delta|epsilon|lambda|mu|nu|rho|sigma|tau|phi|chi|psi|omega)[^<>\s]*)/g;
  text = text.replace(latexRegex, (match: string) => {
    const key = `__LATEX_${sectionIndex++}__`;
    latexSections[key] = match;
    return key;
  });

  // Code blocks
  text = text.replace(/```([\s\S]*?)```/g, (_, code: string) => `<div class="code-block"><pre><code>${DOMPurify.sanitize(code)}</code></pre></div>`);

  // Inline code
  text = text.replace(/`([^`]+)`/g, (_, code: string) => `<code>${DOMPurify.sanitize(code)}</code>`);

  // Newlines
  text = text.replace(/\n/g, '<br>');

  // Indents
  text = text.replace(/^\s+/gm, match => '&nbsp;'.repeat(match.length));

  // Other formats
  text = text
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')    // Bold
    .replace(/\*(.*?)\*/g, '<i>$1</i>')        // Italic
    .replace(/~(.*?)~/g, '<u>$1</u>')          // Underline
    .replace(/~~(.*?)~~/g, '<s>$1</s>');       // Strikethrough

  // Restore LaTeX sections
  text = text.replace(/__LATEX_(\d+)__/g, (_, index: string) => {
    const latexKey = `__LATEX_${index}__`;
    const latexMatch = latexSections[latexKey] ?? '';
    try {
      return katex.renderToString(latexMatch, { throwOnError: false });
    } catch {
      return latexMatch;
    }
  });

  console.log("Formatted text:", text);
  return text;
};

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
        timestamp: new Date(message.timestamp), // Ensure timestamp is a Date object
      }));
      setChatMessages(chatMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).reverse());
    }
  }, [chatHistoryQuery?.data]);

  useEffect(() => {
    if (!completedTyping && chatMessages.length > 0 && chatMessages[0]?.type === false) {
      let i = 0;
      const stringResponse = chatMessages[0].text;
      const intervalId = setInterval(() => {
        setDisplayResponse(stringResponse.slice(0, i));
        i++;
        if (i > stringResponse.length) {
          clearInterval(intervalId);
          setCompletedTyping(true);
          inputRef.current?.focus();
        }
      }, 20);
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
        timestamp: message.timestamp.toISOString(), // Store as string in ISO format
      });
    }
  };

  const fetchAndStoreChatHistory = async (inputText: string, userMessage: ChatMessage) => {
    setLoading(true);
    abortController.current = new AbortController();
    try {
      // Construct the chat history to send to the backend
      const chatHistory = chatMessages.map(message => ({
        role: message.type ? 'user' : 'assistant',
        content: message.text,
      }));
      // Add the new user message
      chatHistory.push({
        role: 'user',
        content: inputText,
      });

      const response = await fetch("/api/LLM", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: inputText, chatHistory }), // Send chatHistory
        signal: abortController.current.signal,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log("Fetched result:", result);
      const llmMessage = formatText(result.choices[0].message.content);
      const llmTimestamp = getPreciseTimestamp();
      const llmResponseMessage: ChatMessage = { type: false, text: llmMessage, session: sessionId.current, timestamp: llmTimestamp };
      setChatMessages(prevMessages => [...prevMessages, llmResponseMessage].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).reverse());
      setLastMessage(llmResponseMessage);
      setCompletedTyping(false); // Reset typing animation state
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
    console.log("User message:", userMessage);
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

  const sanitizedHtml = (html: string) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  return (
    <div className="flex flex-col h-screen">
      <div id="chat-container" className="overflow-auto rounded p-4 flex space-y-2 flex-grow">
        {loading && (
          <div className="p-2 rounded-lg my-2 max-w-sm text-sm bg-gray-300 text-white self-start animate-pulse">
            Loading...
          </div>
        )}
        {chatMessages.map((message, index) => (
          <div key={index} className={`p-2 rounded-lg my-2 max-w-sm text-sm ${message.type ? 'bg-blue-500 text-white self-end' : message.text.includes('generation-stopped') ? '' : 'bg-green-500 text-white self-start'}`}>
            {index === 0 && !message.type && message.session === sessionId.current && !completedTyping ? (
              <span dangerouslySetInnerHTML={sanitizedHtml(displayResponse + (!completedTyping ? '<span class="cursor"></span>' : ''))}></span>
            ) : (
              <span dangerouslySetInnerHTML={sanitizedHtml(message.text)}></span>
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
