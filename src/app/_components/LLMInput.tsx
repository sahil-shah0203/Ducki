import { useState, useEffect, useRef } from 'react';

interface LLMInputProps {
  onFetchResults: (choices: Choice[]) => void;
  onError: (error: string | null) => void;
  clearChatTrigger: boolean;
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

export default function LLMInput({ onFetchResults, onError, clearChatTrigger }: LLMInputProps) {
  const [inputText, setInputText] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [displayResponse, setDisplayResponse] = useState<string>("");
  const [completedTyping, setCompletedTyping] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const abortController = useRef(new AbortController());

  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (!completedTyping && chatMessages.length > 0 && chatMessages[0] && chatMessages[0].type === 'llm') {
      setCompletedTyping(false);
      let i = 0;
      const stringResponse = chatMessages[0].text;

      const intervalId = setInterval(() => {
        setDisplayResponse(stringResponse.slice(0, i));
        i++;

        if (i > stringResponse.length) {
          clearInterval(intervalId);
          setCompletedTyping(true);
        }
      }, 20);

      return () => clearInterval(intervalId);
    }
  }, [chatMessages, completedTyping]);

  useEffect(() => {
    if (clearChatTrigger) {
      setChatMessages([]); // Clear chat messages when the prop changes
    }
  }, [clearChatTrigger]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    onError(null);
    setChatMessages(prevMessages => [{ type: 'user', text: inputText }, ...prevMessages]);
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
      setChatMessages(prevMessages => [{ type: 'llm', text: llmMessage }, ...prevMessages]);
      setCompletedTyping(false); // Set completed typing to false for the new message
      setIsGenerating(false);
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
    setChatMessages(prevMessages => [{ type: 'llm', text: '<span class="generation-stopped">ducki response generation stopped</span>' }, ...prevMessages]);
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
          type="text"
          className="border rounded py-1 px-2 flex-grow text-black text-sm"
          value={inputText}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter text for LLM"
          aria-label="Text input for LLM prompt"
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
