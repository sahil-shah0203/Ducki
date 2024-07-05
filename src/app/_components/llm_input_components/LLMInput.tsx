import { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { api } from "~/trpc/react";
import 'katex/dist/katex.min.css';
import { ChatMessageType } from './ChatMessage';
import { formatText } from './formatText';
import ChatContainer from './ChatContainer';
import InputField from './InputField';

interface LLMInputProps {
  onFetchResults: (choices: any[]) => void;
  onError: (error: string | null) => void;
  user_id: number | undefined;
  selectedClassName: string | null;
  selectedClassID: number | null;
}

export default function LLMInput({ onFetchResults, onError, user_id, selectedClassName, selectedClassID }: LLMInputProps) {
  const [inputText, setInputText] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [displayResponse, setDisplayResponse] = useState<string>("");
  const [completedTyping, setCompletedTyping] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const abortController = useRef(new AbortController());
  const inputRef = useRef<HTMLInputElement>(null);
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
      const chatMessages: ChatMessageType[] = storedChatMessages.map(message => ({
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

  const storeChatHistory = (message: ChatMessageType, isUserMessage: boolean) => {
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

  const fetchAndStoreChatHistory = async (inputText: string, userMessage: ChatMessageType) => {
    setLoading(true);
    abortController.current = new AbortController();
    try {
      const chatHistory = [...chatMessages, userMessage].map(message => ({
        role: message.type ? 'user' : 'assistant',
        content: message.text,
      })).reverse();

      const response = await fetch("/api/LLM", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: inputText, chatHistory }),
        signal: abortController.current.signal,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log("Fetched result:", result);
      const llmMessage = formatText(result.choices[0].message.content);
      const llmTimestamp = getPreciseTimestamp();
      const llmResponseMessage: ChatMessageType = { type: false, text: llmMessage, session: sessionId.current, timestamp: llmTimestamp };
      setChatMessages(prevMessages => [...prevMessages, llmResponseMessage].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).reverse());
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
    const userMessage: ChatMessageType = { type: true, text: inputText, session: sessionId.current, timestamp: userTimestamp };
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
      <ChatContainer
        chatMessages={chatMessages}
        displayResponse={displayResponse}
        loading={loading}
        completedTyping={completedTyping}
        sessionId={sessionId.current}
        sanitizedHtml={sanitizedHtml}
      />
      <InputField
        inputRef={inputRef}
        inputText={inputText}
        isGenerating={isGenerating}
        handleInputChange={handleInputChange}
        handleKeyPress={handleKeyPress}
        handleSubmit={handleSubmit}
        handleStopGeneration={handleStopGeneration}
      />
    </div>
  );
}
