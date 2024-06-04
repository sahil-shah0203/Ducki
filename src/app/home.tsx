"use client";

import { useState } from 'react';
import LLMInput from './_components/LLMInput';


export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const [choices, setChoices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full justify-end">
      <div className="flex-grow p-4 overflow-auto">
        {error && <p className="text-red-500">{error}</p>}
      </div>
      <LLMInput
        onFetchResults={setChoices}
        onError={setError}
      />
    </div>
  );
}
