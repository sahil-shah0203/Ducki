"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import MainPage from "~/app/page";
import { useState } from "react";
import GroupCards from "~/app/_components/GroupCards";
import FileUpload from "~/app/_components/FileUpload";
import { v4 as uuidv4 } from 'uuid';

export default function ClassPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const user_id = searchParams.get("user");
  const class_id = searchParams.get("classID");
  const selectedClassName = searchParams.get("className");

  const [error, setError] = useState<string | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [groupId, setGroupId] = useState<string>("");

  if (!user) {
    router.push("/");
  }

  const user_id_number = Number(user_id);
  const class_id_number = Number(class_id);

  const handleGroupSelect = (groupId: string) => {
    router.push(`/classes/${class_id}/groups/${groupId}/?user=${user_id}&className=${selectedClassName}&classID=${class_id}`);
  };

  const startNewSession = () => {
    setSessionStarted(true);
    const newGroupId = uuidv4(); // Generate a new unique group ID
    setGroupId(newGroupId); // Store the new group ID
    console.log("New Group ID:", newGroupId);
  };

  return (
    <div className="flex flex-row w-full h-screen">
      <MainPage />
      <div className="w-full max-w-8xl p-4 z-10">
        {!sessionStarted ? (
          <button
            onClick={startNewSession}
            className="flex w-full items-center justify-center space-x-3 rounded-xl border-2 border-dashed border-[#FFE072] bg-[#FFF0CB] px-2 py-4 shadow-md bg-opacity-50"
          >
            <div className="flex items-center justify-center rounded-full bg-[#325B46] p-2">
              <img
                src="/Group 10.png"
                alt="Paperclip Icon"
                className="h-4 w-4"
              />
            </div>
            <div className="flex flex-col items-start py-4">
              <span className="font-bold">Start Session</span>
              <span className="text-gray-500">
                Click to add lecture files, presentations, or notes to begin
              </span>
            </div>
          </button>
        ) : (
          <>
            <FileUpload
              onError={setError}
              setSessionId={setSessionId}
              user_id={user_id_number}
              class_id={class_id_number}
              group_id={groupId}
              selectedClassName={selectedClassName}
            />
            {groupId && (
              <GroupCards
                class_id={class_id_number}
                group_id={groupId} // Pass the new group ID to GroupCards
                onGroupSelect={handleGroupSelect}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
