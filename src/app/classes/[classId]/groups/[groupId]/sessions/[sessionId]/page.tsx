"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
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
  const groupID = searchParams.get("groupID");
  const sessionID = searchParams.get("sessionID");

  const [isPopupCollapsed, setIsPopupCollapsed] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const utils = api.useContext();
  const addEventMutation = api.events.addEvent.useMutation({
    onSuccess: async () => {
      await utils.events.getEventsByUserId.invalidate({
        user_id: Number(user_id),
      });
      alert("Review sessions have been scheduled!");
    },
    onError: (error) => {
      console.error("Error scheduling events:", error.message);
      alert("Failed to schedule review sessions. Please try again.");
    },
  });

  if (!groupID) {
    throw new Error("Group ID is needed");
  }

  const user_id_number = Number(user_id);
  const selectedClassID_number = Number(selectedClassID);

  if (!user) {
    router.push("/");
  }

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
        start: new Date(
          now.getTime() + day * 24 * 60 * 60 * 1000,
        ).toISOString(),
        end: new Date(
          now.getTime() + day * 24 * 60 * 60 * 1000 + 60 * 60 * 1000,
        ).toISOString(), // 1 hour later
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
      router.push(
        `/classes/${selectedClassID}/?user=${user_id}&className=${selectedClassName}&classID=${selectedClassID}`,
      );
    }
  };

  console.log("!!", groupID)

  return (
    <div className="flex h-screen w-full flex-row">
      <MainPage />
      <div className="max-w-8xl z-10 w-full p-4">
      <button
          className="flex items-center px-4 py-2 text-white rounded-full hover:bg-gray-100"
          onClick={() =>
        router.back()
          }
        >
          <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="#679881"
        className="w-5 h-5 mr-2"
          >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 19.5L8.25 12l7.5-7.5"
        />
          </svg>
        </button>
        <LLMInput
          onFetchResults={(choices) => console.log(choices)}
          onError={(error) => console.log(error)}
          user_id={user_id_number}
          selectedClassName={selectedClassName}
          selectedClassID={selectedClassID_number}
          uniqueSessionId={sessionID ?? ""}
          firstName={user?.firstName ?? ""}
          groupID={groupID}
        />
      </div>

      <Popup
        userId={user_id?.toString() ?? ""}
        classId={selectedClassID_number ?? 0}
        isCollapsed={isPopupCollapsed}
        groupID={groupID}
        onEndSession={sessionBack}
      />

      <SessionEndDialog isOpen={isDialogOpen} onClose={handleDialogClose} />
    </div>
  );
}