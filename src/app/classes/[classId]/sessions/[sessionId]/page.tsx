"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import MainPage from "~/app/page";
import LLMInput from "~/app/_components/llm_input_components/LLMInput";
import Link from "next/link";

export default function ClassPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();


  if (!user) {
    router.push("/");
  }


  return (
    <div className="container">
      <h1>hi</h1>
    </div>
  );
}
