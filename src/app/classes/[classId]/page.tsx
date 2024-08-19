"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import MainPage from "~/app/page";
import LLMInput from "~/app/_components/llm_input_components/LLMInput";
import Link from "next/link";

import { useState } from "react";
import FileUpload from "~/app/_components/FileUpload";
import { api } from "~/trpc/react";
import SessionCards from "~/app/_components/SessionCards";

export default function ClassPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const user_id = searchParams.get("user");
  const selectedClassName = searchParams.get("className");
  const selectedClassID = searchParams.get("classID");

  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    router.push("/");
  }

  const user_id_number = Number(user_id);
  const selectedClassID_number = Number(selectedClassID);

  const handleSessionSelect = (sessionId: string) => {
    setSessionId(sessionId);

  };

  return (
    <div className="container">
      <MainPage />
      <div className="sidebar_category">
        {!sessionStarted ? (
          <button
            onClick={() => setSessionStarted(true)}
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
          <FileUpload
            onError={setError}
            setSessionId={setSessionId}
            user_id={user_id_number}
            class_id={selectedClassID_number}
            selectedClassName={selectedClassName}
          />
        )}
        <SessionCards
          classId={selectedClassID_number}
          onSessionSelect={handleSessionSelect}
          user_id={user_id_number}
          selectedClassName={selectedClassName}
          selectedClassID={selectedClassID_number}
        />
      </div>
    </div>
  );
}
