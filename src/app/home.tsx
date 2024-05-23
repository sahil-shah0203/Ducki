"use client";

import { useState } from 'react';
import LLMInput from './_components/LLMInput';
import UserInput from './_components/UserInput';

export default function Home() {
  const [choices, setChoices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userError, setUserError] = useState<string | null>(null);

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
      <div className="p-4 flex flex-col w-full">
        {userError && <p className="text-red-500">{userError}</p>}
        {user && (
          <div>
            <p>User Created:</p>
            <p>Email: {user.email}</p>
            <p>First Name: {user.first_name}</p>
            <p>Last Name: {user.last_name}</p>
          </div>
        )}
        <UserInput
          onFetchResults={setUser}
          onError={setUserError}
        />
      </div>
    </div>
  );
}
