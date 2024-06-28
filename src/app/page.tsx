"use client";
import { useUser } from '@clerk/nextjs';
import Landing from './landing';
import Home from './home'; 
import Sidebar from './_components/Sidebar';

import { api } from "~/trpc/react";
import React, {useState} from "react";
import LLMInput from "~/app/_components/LLMInput";

export default function MainPage() {
  const { user, isSignedIn } = useUser();
  // New state for selected class
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [choices, setChoices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Function to handle class selection from sidebar
  const handleClassSelect = (selectedClass: string) => {
    setSelectedClass(selectedClass);
  };

  if (!isSignedIn) {
    return <Landing />;
  } else {
    const user_email = user?.emailAddresses[0]?.emailAddress;
    const first_name = user?.firstName;
    const last_name = user?.lastName;

    if (!user_email || !first_name || !last_name) {
      return <div>Error: Unable to fetch user details</div>;
    }

    const { data: id, error, isLoading } = api.user.getUserByEmail.useQuery({
      email: user_email,
      firstName: first_name,
      lastName: last_name,
    });

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (error) {
      return <div>Error: {error.message}</div>;
    }

    const user_id = id?.user_id;

    return (
      <div className="flex flex-col h-full justify-end">
        <Sidebar userId={user_id} handleClassSelect={handleClassSelect} />
        {selectedClass ? (
          <>
            <div className="flex-grow p-4 overflow-auto">
              {error && <p className="text-red-500">{error}</p>}
            </div>
            <div className="llm-input">
              <LLMInput
                onFetchResults={setChoices}
                onError={setError}
                user_id={user_id}
                selectedClass={selectedClass}
              />
            </div>
          </>
        ) : (
          <Home />
        )}
      </div>
    );
  }
}
