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
  firstName: string; // Add userName prop
}

export default function LLMInput({
                                   onFetchResults,
                                   onError,
                                   user_id,
                                   selectedClassName,
                                   selectedClassID,
                                   uniqueSessionId,
                                   firstName
                                 }: LLMInputProps) {
  const [inputText, setInputText] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [displayResponse, setDisplayResponse] = useState<string>("");
  const [completedTyping, setCompletedTyping] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hydrated, setHydrated] = useState(false);
  const [firstVisit, setFirstVisit] = useState<boolean>(false); // Track if it's the first visit

  const chatHistoryQuery = api.session.getChatHistoryBySessionId.useQuery({ session_id: uniqueSessionId });

  const storeChatMessageMutation = api.session.storeChatMessage.useMutation();

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const fetchChatHistory = async () => {
      const response = await chatHistoryQuery.refetch();

      // Determine if it's the first visit based on chat history
      if (response.data && response.data.length === 0) {
        setFirstVisit(true);
      } else {
        setFirstVisit(false);
      }
    };

    fetchChatHistory();
  }, [uniqueSessionId]);

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
    if (firstVisit) {
      const initialMessage = `hey ducki, my name is ${firstName}, and I'm ready to start my session about class: ${selectedClassName}.`;
      fetchInitialLLMResponse(initialMessage);
    }
  }, [firstVisit, firstName, selectedClassName]);

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
      await storeChatMessageMutation.mutateAsync({
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

  const fetchInitialLLMResponse = async (initialMessage: string) => {
    // Send initial hidden message to LLM API
    try {
      const response = await fetch('/api/LLM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatHistory: [],
          prompt: initialMessage,
          session: uniqueSessionId,
          class_id: selectedClassID,
        }),
      });

      const data = await response.json();
      if (!data.result) throw new Error('No response body');

      const modelResponse = data.result;
      const llmTimestamp = getPreciseTimestamp();
      const llmResponseMessage: ChatMessageType = {
        type: false, // LLM message
        text: modelResponse,
        session: uniqueSessionId,
        timestamp: llmTimestamp,
      };

      // Display LLM response as the first message
      setChatMessages([llmResponseMessage]);
      setCompletedTyping(false);
      setIsGenerating(false);

      // Store LLM response in the database
      await storeChatHistory(llmResponseMessage, false);

    } catch (err) {
      console.error("Error fetching initial LLM response:", err);
      onError("Failed to fetch response from the server.");
      setIsGenerating(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchAndStoreChatHistory = async (inputText: string) => {
    setLoading(true);

    const chatHistory = chatMessages.map(message => ({
      role: message.type ? 'user' : 'assistant',
      content: message.text,
    }));

    try {
      const response = await fetch('/api/LLM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatHistory: chatHistory,
          prompt: inputText,
          session: uniqueSessionId,
          class_id: selectedClassID,
        }),
      });

      const data = await response.json();
      if (!data.result) throw new Error('No response body');

      const modelResponse = data.result;
      const llmTimestamp = getPreciseTimestamp();
      const llmResponseMessage: ChatMessageType = {
        type: false,
        text: modelResponse,
        session: uniqueSessionId,
        timestamp: llmTimestamp
      };
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
    await chatHistoryQuery.refetch();
  };

  const handleAudioInput = async (e: React.FormEvent, audioURL: string) => {
    e.preventDefault();
    onError(null);
    console.log("I'm here!" + audioURL);

    try {
      const blobResponse = await fetch(audioURL);
      const audioBlob = await blobResponse.blob();
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav'); // Append the audio blob directly
    
      const response = await fetch('/api/Whisper', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      console.log(data);
      // if (!data.result) throw new Error('No response body');

      const transcriptionText = data.transcription;
      console.log('Transcription:', transcriptionText);
      setInputText(transcriptionText);
    } catch (error) {
      console.error("Error during transcription:", error);
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);

    const userTimestamp = getPreciseTimestamp();
    const userMessage: ChatMessageType = {
      type: true,
      text: inputText,
      session: uniqueSessionId,
      timestamp: userTimestamp
    };
    setChatMessages(prevMessages => [...prevMessages, userMessage].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).reverse());
    setInputText('');
    await storeChatHistory(userMessage, true);
    fetchAndStoreChatHistory(inputText);

    setIsGenerating(true);
  };

  const handleStopGeneration = () => {
    setDisplayResponse('<span class="generation-stopped">Response generation stopped</span>');
    const stopTimestamp = getPreciseTimestamp();
    setChatMessages(prevMessages => [...prevMessages, { type: false, text: '<span class="generation-stopped">Response generation stopped</span>', session: uniqueSessionId, timestamp: stopTimestamp }].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).reverse());
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
        sessionId={uniqueSessionId}
      />
      <InputField
        inputRef={inputRef}
        inputText={inputText}
        isGenerating={isGenerating}
        handleInputChange={handleInputChange}
        handleKeyPress={handleKeyPress}
        handleSubmit={handleSubmit}
        handleAudioInput={handleAudioInput}
        handleStopGeneration={handleStopGeneration}
        uniqueSessionId={uniqueSessionId}
      />
    </div>
  );
}
