"use client";
import { useUser } from '@clerk/nextjs';
import Home from './home';
import Sidebar from './_components/sidebar_components/Sidebar';
import Popup from './_components/Popup';
import React, { useState } from 'react';
import LLMInput from '~/app/_components/llm_input_components/LLMInput';
import Background from './Background';
import HomeBackground from '~/app/HomeBackground';
import FileUpload from './_components/FileUpload';
import { api } from "~/trpc/react";
import SessionCards from '~/app/_components/SessionCards';
import { useRouter } from "next/navigation";

export default function MainPage() {
  const { user, isSignedIn } = useUser();
  const [selectedClass, setSelectedClass] = useState<{
    class_id: number;
    class_name: string;
  } | null>(null);
  const [choices, setChoices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPopupCollapsed, setIsPopupCollapsed] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [filesUploaded, setFilesUploaded] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  const { mutateAsync: addSession } = api.session.addSession.useMutation();

  const router = useRouter();

  const handleClassSelect = (
    selectedClass: { class_id: number; class_name: string } | null,
  ) => {
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

  const togglePopup = () => {
    setIsPopupCollapsed(!isPopupCollapsed);
  };

  const handleSessionSelect = (sessionId: string) => {
    setSessionId(sessionId);
    setSessionStarted(true);
    setFilesUploaded(true);
  };

  if (!isSignedIn) {
    router.push("/login");
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
      return (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      );
    }

    if (error) {
      return <div>Error: {error.message}</div>;
    }

    const user_id = userData?.user_id;

    return (
      <div className="relative flex h-screen" style={{ zIndex: 0 }}>
        <Sidebar
          userId={user_id}  // Convert user_id to string
          handleClassSelect={handleClassSelect}
          toggleSidebar={toggleSidebar}
          isCollapsed={isSidebarCollapsed}
          userImage={user_image}
        />
        <div
          className={`flex-grow transition-all duration-300 ${isSidebarCollapsed ? "ml-10" : "ml-64"}`}
        >
          <Background />
          <HomeBackground isCollapsed={isSidebarCollapsed} />
          {selectedClass ? (
            <>
              <div className="flex-grow overflow-auto p-4">
                {error && <p className="text-red-500">{error}</p>}
              </div>
              <div className="p-4">
                {!sessionStarted ? (
                  <>
                    <button
                      onClick={() => handleStartSession(user_id!)}
                      className="bg-[#FFF0CB] py-4 px-2 rounded-xl shadow-md w-full border-2 border-dashed border-[#FFE072] flex items-center justify-center space-x-3"
                    >
                      <div className="bg-[#325B46] rounded-full p-2 flex items-center justify-center">
                        <img src="/Group 10.png" alt="Paperclip Icon" className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col items-start py-4">
                        <span className="font-bold">Start Session</span>
                        <span className="text-gray-500">Click to add lecture files, presentations, or notes to begin</span>
                      </div>
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
                        selectedClassName={selectedClass.class_name}
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
                      firstName={first_name}
                    />
                  )
                )}
              </div>
            </>
          ) : (
            <Home />
          )}
        </div>
        <Popup
          userId={user_id?.toString() ?? ''}  // Convert user_id to string
          classId={selectedClass?.class_id ?? 0} // Provide a default value for classId
          toggleSidebar={togglePopup}
          isCollapsed={isPopupCollapsed}
          uniqueSessionId={sessionId}
        />
      </div>
    );
  }
}
