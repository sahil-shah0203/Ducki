"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import MainPage from "~/app/page";
import ProfileSettings from "./ProfileSettings";

export default function Page() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = searchParams.get("userId");
  const numericUserId = userId ? parseInt(userId, 10) : null;

  if (!user) {
    router.push("/");
    return null;
  }

  return (
    <div className="flex flex-row w-full h-screen">
      <MainPage/>
      <div className="w-full max-w-8xl p-4 z-10">
        <ProfileSettings userId={numericUserId}/>
      </div>
    </div>
  );
}
