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
  const class_name = searchParams.get("className");

  const [error, setError] = useState<string | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false); // State to control dialog visibility
  const [sessionId, setSessionId] = useState<string>("");

  if (!user) {
    router.push("/");
  }

  const user_id_number = Number(user_id);
  const class_id_number = Number(class_id);

  // Function to close the dialog
  const handleCloseDialog = () => setSessionStarted(false);

  return (
    <div className="flex flex-row w-full h-screen">
      <MainPage />
      <div className="w-full max-w-8xl p-4 z-10">

        {/* Adjusted container to position elements with flexbox */}
        <div className="w-full h-[225px] bg-white border-b-2 border-gray-300 flex flex-col justify-between px-0 mt-0">

          {/* Top section */}
          <div className="pl-4">
            <div className="w-[400px] text-black/30 text-lg font-medium font-['DM Sans'] leading-tight">
              Fall 2024
            </div>

            <div className="text-black text-[42px] font-semibold font-['DM Sans'] mb-2">
              {class_name}
            </div>

            {/* New session button */}
            {!sessionStarted ? (
              <button
                onClick={() => setSessionStarted(true)}
                className="h-[37px] p-2 bg-[#85ac9a]/20 rounded-sm justify-center items-center gap-1.5 inline-flex"
              >
                <div className="text-[#669880] text-base font-bold font-['DM Sans']">
                  New Session
                </div>
              </button>
            ) : (
              <FileUpload
                onError={setError}
                setSessionId={setSessionId}
                user_id={user_id_number}
                class_id={class_id_number}
                selectedClassName={""}
                isOpen={sessionStarted} // Pass dialog open state
                onClose={handleCloseDialog} // Pass dialog close function
              />
            )}
          </div>

          {/* Bottom section with the links */}
          <div className="w-[437px] h-[22px] px-1 justify-start items-center gap-8 inline-flex mb-4">
            <div className="text-[#669880] text-base font-bold font-['DM Sans']">Lectures</div>
            <div className="text-black/50 text-base font-medium font-['DM Sans']">Favorites</div>
            <div className="text-black/50 text-base font-medium font-['DM Sans']">Mosaic</div>
          </div>
        </div>

        {/* Group Cards */}
        <GroupCards
          class_id={class_id_number}
          user={user_id_number}
          selectedClassName={""}
        />
      </div>
    </div>
  );
}
