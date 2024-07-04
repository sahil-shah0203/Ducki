"use client";
import { useUser } from '@clerk/nextjs';
import Landing from './landing';
import Home from './home';
import Sidebar from './_components/Sidebar';

import { api } from "~/trpc/react";
import React, { useState } from "react";
import LLMInput from "~/app/_components/LLMInput";
import Background from './Background';
import HomeBackground from "~/app/HomeBackground"; // Import the Background component

export default function MainPage() {
  const { user, isSignedIn } = useUser();
  const [selectedClass, setSelectedClass] = useState<{ class_id: number, class_name: string } | null>(null);
  const [choices, setChoices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleClassSelect = (selectedClass: { class_id: number, class_name: string } | null) => {
    setSelectedClass(selectedClass);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
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
      <div className="relative flex h-full" style={{ zIndex: 0 }}>
        <Sidebar userId={user_id} handleClassSelect={handleClassSelect} toggleSidebar={toggleSidebar} isCollapsed={isSidebarCollapsed} />
        <div className={`flex-grow transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <Background />
          <HomeBackground isCollapsed={isSidebarCollapsed}/>
          {selectedClass ? (
            <>
              <div className="flex-grow p-4 overflow-auto">
                {error && <p className="text-red-500">{error}</p>}
              </div>
              <div className="ml-64">
                <div className="llm-input">
                  <LLMInput
                    onFetchResults={setChoices}
                    onError={setError}
                    user_id={user_id}
                    selectedClassName={selectedClass?.class_name}
                    selectedClassID={selectedClass?.class_id}
                  />
                </div>
              </div>
            </>
          ) : (
            <Home />
          )}
        </div>
      </div>
    );
  }
}
