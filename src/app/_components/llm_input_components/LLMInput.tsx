import { useState, useEffect, useRef } from 'react';
import { api } from "~/trpc/react";
import 'katex/dist/katex.min.css';
import { ChatMessageType } from './ChatMessage';
import ChatContainer from './ChatContainer';
import InputField from './InputField';

interface LLMInputProps {
  onFetchResults: (choices: any[]) => void;
  onError: (error: string | null) => void;
  user_id: number | undefined;
  selectedClassName: string | null;
  selectedClassID: number | null;
  uniqueSessionId: string;
}

export default function LLMInput({ onFetchResults, onError, user_id, selectedClassName, selectedClassID, uniqueSessionId }: LLMInputProps) {
  const [inputText, setInputText] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [displayResponse, setDisplayResponse] = useState<string>("");
  const [completedTyping, setCompletedTyping] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const abortController = useRef(new AbortController());
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionId = useRef(uniqueSessionId);
  const [hydrated, setHydrated] = useState(false);

  const chatHistoryQuery = api.session.getChatHistoryBySessionId.useQuery({ session_id: uniqueSessionId });
  const storeChatMessageMutation = api.session.storeChatMessage.useMutation();

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      const chatContainer = document.getElementById('chat-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [chatMessages, hydrated]);

  useEffect(() => {
    if (chatHistoryQuery.isSuccess) {
      const storedChatMessages = chatHistoryQuery.data;
      const chatMessages: ChatMessageType[] = storedChatMessages.map((message: any) => ({
        type: message.sentByUser,
        text: message.content,
        session: uniqueSessionId,
        timestamp: new Date(message.timestamp),
      }));
      setChatMessages(chatMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).reverse());
    } else if (chatHistoryQuery.isError) {
      console.error("Error fetching chat history:", chatHistoryQuery.error);
      onError("Failed to fetch chat history.");
    }
  }, [chatHistoryQuery.isSuccess, chatHistoryQuery.isError, uniqueSessionId, onError]);

  useEffect(() => {
    if (hydrated && !completedTyping && chatMessages.length > 0 && chatMessages[0]?.type === false) {
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
  }, [chatMessages, completedTyping, hydrated]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const getPreciseTimestamp = () => {
    const timeOrigin = performance.timeOrigin;
    const now = performance.now();
    return new Date(timeOrigin + now);
  };

  const storeChatHistory = async (message: ChatMessageType, isUserMessage: boolean) => {
    try {
      await storeChatMessageMutation.mutate({
        content: message.text,
        sentByUser: isUserMessage,
        timestamp: message.timestamp.toISOString(),
        sessionId: message.session,
      });
    } catch (error) {
      console.error("Error storing chat history:", error);
      onError("Failed to store chat history.");
    }
  };

  const fetchAndStoreChatHistory = async (inputText: string, userMessage: ChatMessageType) => {
    setLoading(true);
    abortController.current = new AbortController();

    let chatHistory = chatMessages.map(message => ({
      role: message.type ? 'user' : 'assistant',
      content: message.text,
    }));

    try {
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatHistory: chatHistory,
          prompt: inputText,
          session: uniqueSessionId,
        }),
        signal: abortController.current.signal,
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let receivedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        receivedText += decoder.decode(value, { stream: true });
        setDisplayResponse(receivedText);
      }

      const model_response = receivedText;
      const llmTimestamp = getPreciseTimestamp();
      const llmResponseMessage: ChatMessageType = { type: false, text: model_response, session: sessionId.current, timestamp: llmTimestamp };
      setChatMessages(prevMessages => [...prevMessages, llmResponseMessage].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).reverse());
      setCompletedTyping(false);
      setIsGenerating(false);
      await storeChatHistory(llmResponseMessage, false);

    } catch (err) {
      console.error("Error fetching response:", err);
      onError("Failed to fetch response from the server.");
      setIsGenerating(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    onError(null);
    const userTimestamp = getPreciseTimestamp();
    const userMessage: ChatMessageType = { type: true, text: inputText, session: sessionId.current, timestamp: userTimestamp };
    setChatMessages(prevMessages => [...prevMessages, userMessage].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).reverse());
    setInputText('');
    await storeChatHistory(userMessage, true);
    fetchAndStoreChatHistory(inputText, userMessage);
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
      handleSubmit(e);
    }
  };

  if (!hydrated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <ChatContainer
        chatMessages={chatMessages}
        displayResponse={displayResponse}
        loading={loading}
        completedTyping={completedTyping}
        sessionId={sessionId.current}
      />
      <InputField
        inputRef={inputRef}
        inputText={inputText}
        isGenerating={isGenerating}
        handleInputChange={handleInputChange}
        handleKeyPress={handleKeyPress}
        handleSubmit={handleSubmit}
        handleStopGeneration={handleStopGeneration}
        uniqueSessionId={uniqueSessionId}
      />
    </div>
  );
}
