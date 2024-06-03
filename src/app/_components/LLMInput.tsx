import { useState, useEffect } from 'react';

interface LLMInputProps {
  onFetchResults: (choices: Choice[]) => void;
  onError: (error: string | null) => void;
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

export default function LLMInput({ onFetchResults, onError }: LLMInputProps) {
  const [inputText, setInputText] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [displayResponse, setDisplayResponse] = useState<string>("");
  const [completedTyping, setCompletedTyping] = useState<boolean>(true);

  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatMessages]);

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
        }
      }, 20);

      return () => clearInterval(intervalId);
    }
  }, [chatMessages, completedTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleSubmit = async () => {
    onError(null);
    setChatMessages(prevMessages => [{ type: 'user', text: inputText }, ...prevMessages]);
    setInputText(''); // Clear the input text immediately after submitting
    setLoading(true); // Set loading state to true
    try {
      const response = await fetch("/api/LLM", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: inputText }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const llmMessage = formatText(result.choices[0].message.content);
      setChatMessages(prevMessages => [{ type: 'llm', text: llmMessage }, ...prevMessages]);
      setCompletedTyping(false); // Set completed typing to false for the new message
    } catch (err) {
      console.error("Error fetching data:", err);
      onError("Failed to fetch response from the server.");
    } finally {
      setLoading(false); // Set loading state to false
    }
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
    <div className="flex flex-col w-full h-screen">
      <div id="chat-container" className="flex-grow mb-4 overflow-auto rounded p-4 flex flex-col-reverse space-y-2">
        {loading && (
          <div className="p-2 rounded-lg my-2 max-w-sm text-sm bg-gray-300 text-white self-start animate-pulse">
            Loading...
          </div>
        )}
        {chatMessages.map((message, index) => (
          <div key={index} className={`p-2 rounded-lg my-2 max-w-sm text-sm ${message.type === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-green-500 text-white self-start'}`}>
            {index === 0 && message.type === 'llm' ? (
              <span dangerouslySetInnerHTML={{ __html: displayResponse + (!completedTyping ? '<span class="cursor"></span>' : '') }}></span>
            ) : (
              <span dangerouslySetInnerHTML={{ __html: message.text }}></span>
            )}
          </div>
        ))}
      </div>
      <div className="sticky bottom-0 w-full flex items-center bg-white p-2 border-t border-gray-200">
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
          onClick={handleSubmit}
          aria-label="Submit prompt to LLM"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
