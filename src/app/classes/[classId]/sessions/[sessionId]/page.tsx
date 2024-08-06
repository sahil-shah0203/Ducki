"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import MainPage from "~/app/page";
import LLMInput from "~/app/_components/llm_input_components/LLMInput";
import Popup from "~/app/_components/Popup";
import SessionEndDialog from "~/app/_components/SessionEndDialog";

export default function SessionPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const user_id = searchParams.get("user");
  const selectedClassName = searchParams.get("className");
  const selectedClassID = searchParams.get("classID");
  const session_id = searchParams.get("sessionID");

  const [isPopupCollapsed, setIsPopupCollapsed] = useState(false); // State for popup collapse
  const [sessionId, setSessionId] = useState<string>(session_id || ""); // State for session ID
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State for dialog open/close

  if (!session_id) {
    throw new Error("Session ID is needed");
  }

  const user_id_number = Number(user_id);
  const selectedClassID_number = Number(selectedClassID);

  if (!user) {
    router.push("/");
  }

  // Function to toggle the popup
  const togglePopup = () => {
    setIsPopupCollapsed(!isPopupCollapsed);
  };

  // Function to handle session end
  const sessionBack = () => {
    setIsDialogOpen(true); // Open the dialog when "End Session" is clicked
  };

  // Function to handle dialog close and other actions
  const handleDialogClose = (scheduleReview: boolean) => {
    setIsDialogOpen(false); // Close the dialog

    if (scheduleReview) {
      // Logic to schedule review sessions can be implemented here
      console.log("Scheduling review sessions...");
      // Simulate scheduling review sessions
      alert("Review sessions have been scheduled!");
    }

    // Redirect back to the class page
    router.push(`/classes/${selectedClassID}`);
  };

  // Debugging: Log component mount
  useEffect(() => {
    console.log("SessionPage component mounted");
  }, []);

  return (
    <div className="container relative min-h-screen">
      <MainPage />
      <div className="sidebar_category">
        <LLMInput
          onFetchResults={(choices) => console.log(choices)}
          onError={(error) => console.log(error)}
          user_id={user_id_number}
          selectedClassName={selectedClassName}
          selectedClassID={selectedClassID_number}
          uniqueSessionId={session_id}
          firstName={user?.firstName ?? ""}
        />
      </div>

      {/* End Session Button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={sessionBack} // Open dialog on click
        >
          End Session
        </button>
      </div>

      {/* Popup Component */}
      <Popup
        userId={user_id?.toString()|| ""}
        classId={selectedClassID_number ?? 0}
        toggleSidebar={togglePopup}
        isCollapsed={isPopupCollapsed}
        uniqueSessionId={sessionId}
      />

      {/* Session End Dialog */}
      <SessionEndDialog isOpen={isDialogOpen} onClose={handleDialogClose} />
    </div>
  );
}
