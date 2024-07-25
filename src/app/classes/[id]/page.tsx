"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import MainPage from "~/app/page";
import LLMInput from "~/app/_components/llm_input_components/LLMInput";
import { connect } from "http2";

export default function ClassPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const user_id = searchParams.get("user");
  const selectedClassName = searchParams.get("className");
  const selectedClassID = searchParams.get("classID");

  if (!user) {
    router.push("/");
  }

  const user_id_number = user_id ? Number(user_id) : undefined;
  const selectedClassID_number = selectedClassID ? Number(selectedClassID) : undefined;

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
        />
      </div>
    </div>
  );
}
