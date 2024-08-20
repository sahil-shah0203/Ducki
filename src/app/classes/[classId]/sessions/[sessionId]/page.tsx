"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import MainPage from "~/app/page";
import LLMInput from "~/app/_components/llm_input_components/LLMInput";
import Popup from "~/app/_components/Popup";
import SessionEndDialog from "~/app/_components/SessionEndDialog";
import { api } from "~/trpc/react";

export default function SessionPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const user_id = searchParams.get("user");
  const selectedClassName = searchParams.get("className");
  const selectedClassID = searchParams.get("classID");
  const session_id = searchParams.get("sessionID");

  const [isPopupCollapsed, setIsPopupCollapsed] = useState(false);
  const [sessionId, setSessionId] = useState<string>(session_id ?? "");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const utils = api.useContext();
  const addEventMutation = api.events.addEvent.useMutation({
    onSuccess: async () => {
      await utils.events.getEventsByUserId.invalidate({ user_id: Number(user_id) });
      alert("Review sessions have been scheduled!");
    },
    onError: (error) => {
      console.error("Error scheduling events:", error.message);
      alert("Failed to schedule review sessions. Please try again.");
    },
  });

  if (!session_id) {
    throw new Error("Session ID is needed");
  }

  const user_id_number = Number(user_id);
  const selectedClassID_number = Number(selectedClassID);

  if (!user) {
    router.push("/");
  }

  const togglePopup = () => {
    setIsPopupCollapsed(!isPopupCollapsed);
  };

  const sessionBack = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = async (selectedDays: number[]) => {
    setIsDialogOpen(false);

    if (selectedDays.length > 0) {
      const now = new Date();
      const newEvents = selectedDays.map((day) => ({
        user_id: user_id_number,
        title: "Review Session",
        description: "Scheduled review session",
        place: "Online",
        start: new Date(now.getTime() + day * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date(now.getTime() + day * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // 1 hour later
      }));
      console.log("Fetched Events from session:", newEvents);
      try {
        for (const event of newEvents) {
          await addEventMutation.mutateAsync(event);
        }
      } catch (error) {
        console.error("Error scheduling events:", error);
      }

      // Only redirect if events were scheduled
      router.push(`/classes/${selectedClassID}/?user=${user_id}&className=${selectedClassName}&classID=${selectedClassID}`);
    }
  };

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

      <Popup
        userId={user_id?.toString() ?? ""}
        classId={selectedClassID_number ?? 0}
        isCollapsed={isPopupCollapsed}
        uniqueSessionId={sessionId}
        onEndSession={sessionBack}
      />

      <SessionEndDialog isOpen={isDialogOpen} onClose={handleDialogClose} />
    </div>
  );
}
