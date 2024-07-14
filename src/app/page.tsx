"use client";
import { useUser } from '@clerk/nextjs';
import Landing from './landing';
import Home from './home';
import Sidebar from './_components/sidebar_components/Sidebar';
import React, { useState } from 'react';
import LLMInput from '~/app/_components/llm_input_components/LLMInput';
import Background from './Background';
import HomeBackground from '~/app/HomeBackground';
import FileUpload from './_components/FileUpload';
import { api } from "~/trpc/react";
import uuid from 'react-uuid';

export default function MainPage() {
  const { user, isSignedIn } = useUser();
  const [selectedClass, setSelectedClass] = useState<{ class_id: number, class_name: string } | null>(null);
  const [choices, setChoices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [filesUploaded, setFilesUploaded] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  const handleClassSelect = (selectedClass: { class_id: number, class_name: string } | null) => {
    setSelectedClass(selectedClass);
    setSessionStarted(false);
    setFilesUploaded(false);
  };

  const handleStartSession = () => {
    setSessionStarted(true);
  };

  const handleFileUploadSuccess = () => {
    setFilesUploaded(true);
    // create session id using uuid
    const newSessionId = uuid();
    setSessionId(newSessionId);
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
    const user_image = user?.imageUrl;

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
      <div className="relative flex h-screen" style={{ zIndex: 0 }}>
        <Sidebar
          userId={user_id}
          handleClassSelect={handleClassSelect}
          toggleSidebar={toggleSidebar}
          isCollapsed={isSidebarCollapsed}
          userImage={user_image}
        />
        <div className={`flex-grow transition-all duration-300 ${isSidebarCollapsed ? 'ml-10' : 'ml-64'}`}>
          <Background />
          <HomeBackground isCollapsed={isSidebarCollapsed} />
          {selectedClass ? (
            <>
              <div className="flex-grow p-4 overflow-auto">
                {error && <p className="text-red-500">{error}</p>}
              </div>
              <div className="p-4">
                {!sessionStarted ? (
                  <button
                    onClick={handleStartSession}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Start Session
                  </button>
                ) : (
                  !filesUploaded ? (
                    <FileUpload
                      onUploadSuccess={handleFileUploadSuccess}
                      onError={setError}
                      setSessionId={setSessionId}
                    />
                  ) : (
                    <LLMInput
                      onFetchResults={setChoices}
                      onError={setError}
                      user_id={user_id}
                      selectedClassName={selectedClass?.class_name}
                      selectedClassID={selectedClass?.class_id}
                      uniqueSessionId={sessionId}
                    />
                  )
                )}
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
