"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import MainPage from "~/app/page";
import { useState } from "react";
import GroupCards from "~/app/_components/GroupCards";
import FileUpload from "~/app/_components/FileUpload";

export default function ClassPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const user_id = searchParams.get("user");
  const class_id = searchParams.get("classID");

  const [error, setError] = useState<string | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false); // New state for session start
  const [sessionId, setSessionId] = useState<string>(""); // New state for session ID

  if (!user) {
    router.push("/");
  }

  const user_id_number = Number(user_id);
  const class_id_number = Number(class_id);

  return (
    <div className="flex flex-row w-full h-screen">
      <MainPage />
      <div className="w-full max-w-8xl p-4 z-10">
        {!sessionStarted ? (
            <button
            onClick={() => setSessionStarted(true)}
            className="h-[37px] p-2 bg-[#85ac9a]/20 rounded-sm justify-center items-center gap-1.5 inline-flex"
            >
            <div className="text-[#669880] text-base font-bold font-['DM Sans']">New Session</div>
            </button>
        ) : (
          <FileUpload
            onError={setError}
            setSessionId={setSessionId}
            user_id={user_id_number}
            class_id={class_id_number}
            selectedClassName={""} // Optional: Adjust this if class name is available
          />
        )}
        
        <GroupCards
          class_id={class_id_number}
          user={user_id_number}
          selectedClassName={""} // Optional: Adjust this if class name is available
        />
      </div>
    </div>
  );
}
