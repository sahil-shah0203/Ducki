import { useState } from 'react';

interface LLMInputProps {
  onFetchResults: (choices: any[]) => void;
  onError: (error: string | null) => void; // Update type to accept null
}

export default function LLMInput({ onFetchResults, onError }: LLMInputProps) {
  const [inputText, setInputText] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleSubmit = async () => {
    onError(null); // Passing null is now allowed
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
      onFetchResults(result.choices);
    } catch (err) {
      console.error("Error fetching data:", err);
      onError("Failed to fetch response from the server.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="p-4 flex items-center w-full">
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
  );
}
