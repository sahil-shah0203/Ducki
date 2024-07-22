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
import SessionCards from '~/app/_components/SessionCards';

export default function MainPage() {
  const { user, isSignedIn } = useUser();
  const [selectedClass, setSelectedClass] = useState<{ class_id: number, class_name: string } | null>(null);
  const [choices, setChoices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [filesUploaded, setFilesUploaded] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  const { mutateAsync: addSession } = api.session.addSession.useMutation();

  const handleClassSelect = (selectedClass: { class_id: number, class_name: string } | null) => {
    console.log('Selected class:', selectedClass);
    setSelectedClass(selectedClass);
    setSessionStarted(false);
    setFilesUploaded(false);
  };

  const handleStartSession = async (user_id: number) => {
    if (selectedClass && user_id) {
      console.log('User ID from database:', user_id);
      setSessionStarted(true);
    }
  };

  const handleFileUploadSuccess = () => {
    setFilesUploaded(true);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSessionSelect = (sessionId: string) => {
    setSessionId(sessionId);
    setSessionStarted(true);
    setFilesUploaded(true);
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

    const { data: userData, error, isLoading } = api.user.getUserByEmail.useQuery({
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

    const user_id = userData?.user_id;

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
                  <>
                    <button
                      onClick={() => handleStartSession(user_id!)}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Start Session
                    </button>
                    <SessionCards classId={selectedClass.class_id} onSessionSelect={handleSessionSelect} />
                  </>
                ) : (
                  !filesUploaded ? (
                    <>
                      <FileUpload
                        onUploadSuccess={handleFileUploadSuccess}
                        onError={setError}
                        setSessionId={setSessionId}
                        user_id={user_id!}
                        class_id={selectedClass.class_id}
                      />
                      <SessionCards classId={selectedClass.class_id} onSessionSelect={handleSessionSelect} />
                    </>
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
