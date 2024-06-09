import {useState, useEffect, useRef} from 'react';

interface LLMInputProps {
  onFetchResults: (choices: any[]) => void;
  onError: (error: string | null) => void;
  user_id: number | undefined;
  selectedClass: string | null;
}

interface ChatMessage {
  type: 'user' | 'llm';
  text: string;
}

interface Choice {
  message: {
    content: string;
  };
}

const CursorSVG = () => (
  <svg
    viewBox="8 4 8 16"
    xmlns="http://www.w3.org/2000/svg"
    className="cursor"
  >
    <rect x="10" y="6" width="4" height="12" fill="#fff" />
  </svg>
);

export default function LLMInput({ onFetchResults, onError, user_id, selectedClass }: LLMInputProps) {
  const [inputText, setInputText] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [displayResponse, setDisplayResponse] = useState<string>("");
  const [completedTyping, setCompletedTyping] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const abortController = useRef(new AbortController()); // Use useRef to create a persistent AbortController instance
  const inputRef = useRef<HTMLInputElement>(null); // Create a reference to the input element
  const [lastMessage, setLastMessage] = useState<ChatMessage | null>(null);

  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    const storedChatMessages = localStorage.getItem(`chatMessages-${selectedClass}`);
    if (storedChatMessages) {
      setChatMessages(JSON.parse(storedChatMessages));
    } else {
      setChatMessages([]); // Clear the chat history if there's no stored chat messages for the selected class
    }
    setCompletedTyping(false);
  }, [selectedClass]);

  useEffect(() => {
    if (
      !completedTyping &&
      chatMessages &&
      chatMessages.length > 0 &&
      chatMessages[0] &&
      chatMessages[0].type === 'llm'
    ) {
      setCompletedTyping(false);
      let i = 0;
      const stringResponse = chatMessages[0].text;

      const intervalId = setInterval(() => {
        setDisplayResponse(stringResponse.slice(0, i));
        i++;

        if (i > stringResponse.length) {
          clearInterval(intervalId);
          setCompletedTyping(true);
          inputRef.current?.focus(); // Refocus on the input element when the typing animation is completed
        }
      }, 20);

      return () => clearInterval(intervalId);
    }
  }, [chatMessages, completedTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    onError(null);
    setChatMessages(prevMessages => {
      const updatedChatMessages: ChatMessage[] = [{ type: 'user' as const, text: inputText }, ...prevMessages];
      localStorage.setItem('chatMessages', JSON.stringify(updatedChatMessages));
      return updatedChatMessages;
    });
    setInputText(''); // Clear the input text immediately after submitting
    setLoading(true); // Set loading state to true
    abortController.current = new AbortController(); // Create a new AbortController instance for each generation

    try {
      const response = await fetch("/api/LLM", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: inputText }),
        signal: abortController.current.signal, // Use the current property to access the AbortController instance
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const llmMessage = formatText(result.choices[0].message.content);
      setChatMessages(prevMessages => {
        const updatedChatMessages: ChatMessage[] = [{ type: 'llm' as const, text: llmMessage }, ...prevMessages];
        localStorage.setItem(`chatMessages-${selectedClass}`, JSON.stringify(updatedChatMessages));
        return updatedChatMessages;
      });
      setLastMessage({ type: 'llm' as const, text: llmMessage });
      setCompletedTyping(false); // Set completed typing to false for the new message
      setIsGenerating(false);

      // Store the user's message in the database
      await fetch('/api/chats/storeChatHistory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user_id,
          class_id: selectedClass,
          content: inputText,
          direction: 'user',
          timestamp: new Date().toISOString()
        }),
      });

      // Store the LLM's message in the database
      await fetch('/api/chats/storeChatHistory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user_id,
          class_id: selectedClass,
          content: llmMessage,
          direction: 'llm',
          timestamp: new Date().toISOString()
        }),
      });

    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error("Error fetching data:", err);
        onError("Failed to fetch response from the server.");
      }
      setIsGenerating(false);
    } finally {
      setLoading(false); // Set loading state to false
    }
  };

  const handleStopGeneration = () => {
    abortController.current.abort(); // Use the current property to access the AbortController instance
    setDisplayResponse('<span class="generation-stopped">ducki response generation stopped</span>'); // Immediately update the displayResponse state
    setChatMessages(prevMessages => [{ type: 'llm', text: '<span class="generation-stopped">ducky response generation stopped</span>' }, ...prevMessages]);
    setIsGenerating(false); // Set isGenerating to false when the generation is stopped
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputText !== '') {
      handleSubmit();
    }
  };

  const formatText = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')  // Bold
      .replace(/\*(.*?)\*/g, '<i>$1</i>')      // Italic
      .replace(/\+(.*?)\+/g, '<u>$1</u>');     // Underline
  };

  return (
    <div className="flex flex-col h-screen">
      <div id="chat-container" className="overflow-auto rounded p-0 flex flex-col-reverse space-y-2 flex-grow">
        {loading && (
          <div className="p-2 rounded-lg my-2 max-w-sm text-sm bg-gray-300 text-white self-start animate-pulse">
            Loading...
          </div>
        )}
        {chatMessages.map((message, index) => (
          <div key={index} className={`p-2 rounded-lg my-2 max-w-sm text-sm ${message.type === 'user' ? 'bg-blue-500 text-white self-end' : message.text.includes('generation-stopped') ? '' : 'bg-green-500 text-white self-start'}`}>
            {index === 0 && message.type === 'llm' ? (
              <span dangerouslySetInnerHTML={{ __html: displayResponse + (!completedTyping ? '<span class="cursor"></span>' : '') }}></span>
            ) : (
              <span dangerouslySetInnerHTML={{ __html: message.text }}></span>
            )}
          </div>
        ))}
      </div>
      <div className="w-full flex items-center bg-transparent p-12 border-12 mb-12">
        <input
          ref={inputRef} // Attach the reference to the input element
          type="text"
          className="border rounded py-1 px-2 flex-grow text-black text-sm"
          value={inputText}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter text for LLM"
          aria-label="Text input for LLM prompt"
          disabled={isGenerating} // Disable the input field when LLM is generating
        />
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded ml-2"
          onClick={isGenerating ? handleStopGeneration : handleSubmit}
          aria-label={isGenerating ? "Stop Generation" : "Submit prompt to LLM"}
          disabled={isGenerating} // Disable the button when LLM is generating
        >
          {isGenerating ? "Stop Generation" : "Submit"}
        </button>
      </div>
    </div>
  );
}
