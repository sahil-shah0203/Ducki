"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import MainPage from "~/app/page";
import LLMInput from "~/app/_components/llm_input_components/LLMInput";

export default function SessionPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const user_id = searchParams.get("user");
  const selectedClassName = searchParams.get("className");
  const selectedClassID = searchParams.get("classID");
  const session_id = searchParams.get("sessionID")

  if(!session_id){
    throw new Error("Session ID is needed")
  }

  const user_id_number = Number(user_id);
  const selectedClassID_number = Number(selectedClassID);


  if (!user) {
    router.push("/");
  }


  return (
    <div className="container">
      <MainPage />
      <div className="sidebar_category">
      <LLMInput
          onFetchResults={(choices) => console.log(choices)}
          onError={(error) => console.log(error)}
          user_id={user_id_number}
          selectedClassName={selectedClassName}
          selectedClassID={selectedClassID_number}
          uniqueSessionId={session_id}
        />
      </div>
    </div>
  );
}
