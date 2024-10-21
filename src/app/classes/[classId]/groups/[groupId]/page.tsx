"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import MainPage from "~/app/page";
import { useState, useEffect } from "react";
import FileUpload from "~/app/_components/FileUpload";
import SessionCards from "~/app/_components/SessionCards";

export default function ClassPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract parameters from the URL query
  const user_id = searchParams.get("user");
  const selectedClassName = searchParams.get("className");
  const selectedClassID = searchParams.get("classID");
  const selectedGroupID = searchParams.get("groupID");

  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Redirect to the homepage if the user is not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  // Convert the user_id and classID to numbers for further usage
  const user_id_number = user_id ? Number(user_id) : null;
  const selectedClassID_number = selectedClassID ? Number(selectedClassID) : null;

  const handleSessionSelect = (sessionId: string) => {
    setSessionId(sessionId);
  };

  // Check if required data is missing or invalid
  if (!selectedClassID_number || !selectedGroupID) {
    return <div>Error: Missing class or group information.</div>;
  }

  return (
    <div className="flex flex-row w-full h-screen">
      <MainPage />
      <div className="w-full max-w-8xl p-4 z-10">
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
            user_id={user_id_number ?? 0}
            class_id={selectedClassID_number ?? 0}
            selectedClassName={selectedClassName ?? ""}
          />
        )}
        <SessionCards
          onSessionSelect={handleSessionSelect}
          user_id={user_id_number ?? 0}
          selectedGroupID={selectedGroupID || ""}
          selectedClassID={selectedClassID}
          selectedClassName={selectedClassName}
        />
      </div>
    </div>
  );
}
