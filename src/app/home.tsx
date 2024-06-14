'use client';

import { useState } from 'react';
import LLMInput from './_components/LLMInput';

interface HomeProps {
  clearChatTrigger: boolean;
}

export default function Home({ clearChatTrigger }: HomeProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [choices, setChoices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full justify-end">
      <div className="flex-grow p-4 overflow-auto">
        hello
        {error && <p className="text-red-500">{error}</p>}
      </div>
      <LLMInput
        onFetchResults={setChoices}
        onError={setError}
        clearChatTrigger={clearChatTrigger} // Pass the trigger prop
      />
    </div>
  );
}
