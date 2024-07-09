"use client";
import { useUser } from '@clerk/nextjs';
import Landing from './landing';
import Dashboard from './_components/sidebar_components/dashboard';
import Sidebar from './_components/sidebar_components/Sidebar';
import { api } from "~/trpc/react";
import React, { useState } from "react";
import LLMInput from "~/app/_components/llm_input_components/LLMInput";
import Background from './Background';
import HomeBackground from "~/app/HomeBackground"; // Import the Background component
import Calendar from './_components/sidebar_components/calendar';

const getInitialSection = () => {
  if (typeof window !== "undefined") {
    const path = window.location.pathname.substring(1);
    if (path === "") {
      window.history.replaceState(null, '', '/dashboard');
      return "dashboard";
    }
    return path;
  }
  return "dashboard";
};

export default function MainPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [selectedClass, setSelectedClass] = useState<{ class_id: number, class_name: string } | null>(null);
  const [choices, setChoices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>(getInitialSection());

  const handleClassSelect = (selectedClass: { class_id: number, class_name: string } | null) => {
    setSelectedClass(selectedClass);
    setSelectedSection(""); // Clear the selected section
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (!isLoaded) {
    return <div>Loading...</div>; // Display a loading state while user data is being fetched
  }

  if (!isSignedIn) {
    return <Landing />;
  } else {
    const user_email = user?.emailAddresses[0]?.emailAddress;
    const first_name = user?.firstName;
    const last_name = user?.lastName;
    const user_image = user?.imageUrl; // Get the user's image URL

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
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
        />
        <div className={`flex-grow transition-all duration-300 ${isSidebarCollapsed ? 'ml-10' : 'ml-64'}`}>
          <Background />
          <HomeBackground isCollapsed={isSidebarCollapsed} />
          {selectedSection === "dashboard" && <Dashboard />}
          {selectedSection === "calendar" && <Calendar />}
          {selectedSection === "chat" && <div>Chat Content</div>}
          {selectedSection === "" && selectedClass && (
            <>
              <div className="flex-grow p-4 overflow-auto">
                {error && <p className="text-red-500">{error}</p>}
              </div>
              <div>
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
          )}
        </div>
      </div>
    );
  }
}
