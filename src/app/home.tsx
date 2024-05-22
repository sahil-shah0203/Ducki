"use client";

import { useState } from 'react';
import LLMInput from './_components/LLMInput';

export default function Home() {
  const [choices, setChoices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-screen justify-end">
      <div className="p-4 flex flex-col w-full">
        {error && <p className="text-red-500">{error}</p>}
        {choices.map((choice, index) => (
          <p key={index} className="text-black">{choice.message.content}</p>
        ))}
      </div>
      <LLMInput
        onFetchResults={setChoices}
        onError={setError}
      />
    </div>
  );
}
