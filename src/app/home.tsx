"use client";

import { useState } from 'react';
import LLMInput from './_components/LLMInput';


interface HomeProps {
  userId: number | undefined;
}

export default function Home({ userId }: HomeProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const [choices, setChoices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  console.log(userId);

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
