import { useState, useEffect, useRef } from 'react';
// import DOMPurify from 'dompurify';
import AWS from 'aws-sdk';
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
  const sessionId = useRef(Date.now().toString());

  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (user_id && selectedClassID) {
        try {
          const storedChatMessages = [
            { content: "Hello", sentByUser: true, timestamp: new Date() },
            { content: "Hi there!", sentByUser: false, timestamp: new Date() }
          ];
          const chatMessages: ChatMessageType[] = storedChatMessages.map(message => ({
            type: message.sentByUser,
            text: message.content,
            session: sessionId.current,
            timestamp: new Date(message.timestamp),
          }));
          setChatMessages(chatMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).reverse());
        } catch (error) {
          console.error("Error fetching chat history:", error);
        }
      }
    };

    fetchChatHistory();
  }, [user_id, selectedClassID]);

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
    // Store chat history logic here
  };

  const fetchAndStoreChatHistory = async (inputText: string, userMessage: ChatMessageType) => {
    setLoading(true);
    abortController.current = new AbortController();

    const lambda = new AWS.Lambda({
      region: 'us-east-1',
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
    });

    const params = {
      FunctionName: 'prompt_model',
      Payload: JSON.stringify({
        prompt: inputText,
        index: uniqueSessionId,
        chatHistory: chatMessages.map(message => ({
          role: message.type ? 'user' : 'assistant',
          content: message.text,
        })).reverse(),
      }),
    };

    try {
      const result = await lambda.invoke(params).promise();
      const response = JSON.parse(result.Payload as string);

      console.log("Lambda response:", response);

      if (response.statusCode === 200 && response.body) {
        const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
        if (body.status === 'success') {
          const model_response = body.model_reponse;
          // const llmMessage = formatText(model_response);
          const llmMessage = model_response;
          const llmTimestamp = getPreciseTimestamp();
          const llmResponseMessage: ChatMessageType = { type: false, text: llmMessage, session: sessionId.current, timestamp: llmTimestamp };
          setChatMessages(prevMessages => [...prevMessages, llmResponseMessage].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).reverse());
          setCompletedTyping(false);
          setIsGenerating(false);
          storeChatHistory(llmResponseMessage, false);
        } else {
          throw new Error('Lambda response status not successful');
        }
      } else {
        throw new Error('Invalid Lambda response');
      }
    } catch (err) {
      console.error("Error invoking Lambda function:", err);
      onError("Failed to fetch response from the server.");
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