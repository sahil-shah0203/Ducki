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
    <div className="container">
      <MainPage />
      <div className="sidebar_category">
        <ProfileSettings userId={numericUserId} />
      </div>
    </div>
  );
}
