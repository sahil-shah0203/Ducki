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

export default function LLMInput({ onFetchResults, onError }: LLMInputProps) {
  const [inputText, setInputText] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    // This will be triggered after every render, which includes after chatMessages updates.
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatMessages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleSubmit = async () => {
    onError(null);
    setChatMessages(prevMessages => [{ type: 'user', text: inputText }, ...prevMessages]);
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
      const llmMessage = result.choices[0].message.content;
      setChatMessages(prevMessages => [{ type: 'llm', text: llmMessage }, ...prevMessages]);
      setInputText('');
    } catch (err) {
      console.error("Error fetching data:", err);
      onError("Failed to fetch response from the server.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputText !== '') {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col w-full h-screen">
      <div id="chat-container" className="flex-grow mb-4 overflow-auto rounded p-4 flex flex-col-reverse space-y-2">
        {chatMessages.map((message, index) => (
          <div key={index} className={`p-2 rounded-lg my-2 max-w-xs ${message.type === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-green-500 text-white self-start'}`}>
            {message.text}
          </div>
        ))}
      </div>
      <div className="sticky bottom-0 w-full flex items-center bg-white p-2 border-t border-gray-200">
        <input
          type="text"
          className="border rounded py-1 px-2 flex-grow text-black"
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
