import { useState } from 'react';

interface LLMInputProps {
  onFetchResults: (choices: Choice[]) => void;
  onError: (error: string | null) => void;
}

interface ChatMessage {
  type: 'user' | 'llm';
  text: string;
}

interface Choice {
  text: string;
}

export default function LLMInput({ onFetchResults, onError }: LLMInputProps) {
  const [inputText, setInputText] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleSubmit = async () => {
    onError(null);
    setChatMessages(prevMessages => [...prevMessages, { type: 'user', text: inputText }]);
    try {
      const response = await fetch("/api/LLM", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: inputText,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log(result); // Log the response to the console
      onFetchResults(result.choices);
      result.choices.forEach((choice: Choice) => {
        setChatMessages(prevMessages => [...prevMessages, { type: 'llm', text: choice.text }]);
      });
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
    <div className="p-4 flex flex-col items-center w-full">
      <div className="w-full mb-4 overflow-auto h-64 rounded p-4 flex flex-col space-y-2">
        {chatMessages.map((message, index) => (
          <div key={index} className={`p-2 rounded-lg my-2 ${message.type === 'user' ? 'bg-blue-500 text-white ml-auto' : 'bg-green-500 text-white mr-auto'}`}>
            {message.text}
          </div>
        ))}
      </div>
      <div className="w-full flex items-center">
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