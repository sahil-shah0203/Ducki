"use client";

import { useState } from 'react';

export default function Home() {
  const [inputText, setInputText] = useState<string>("");
  const [choices, setChoices] = useState<any[]>([]);  // Explicitly type the choices array
  const [error, setError] = useState<string | null>(null); // State for error handling

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleSubmit = async () => {
    setError(null); // Clear any previous errors
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
      setChoices(result.choices);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch response from the server.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-screen justify-end">
      <div className="p-4 flex flex-col w-full">
        {error && <p className="text-red-500">{error}</p>}
        {choices.map((choice, index) => (
          <p key={index} className="text-black">{choice.message.content}</p>
        ))}
      </div>
      <div className="p-4 flex items-center w-full">
        <input
          type="text"
          className="border rounded py-1 px-2 flex-grow text-black"
          value={inputText}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter text for LLM"
        />
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded ml-2"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
