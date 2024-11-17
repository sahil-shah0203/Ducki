"use client";
import { useUser } from "@clerk/nextjs";
import MainPage from "~/app/page";
import { useRouter, useSearchParams } from "next/navigation";

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const user_id = searchParams.get("user");

  console.log(user_id);
  if (!user) {
    router.push("/");
  }

  return (
    <div className="flex flex-row w-full h-screen">
      <MainPage/>
      <div className="w-full max-w-8xl p-4 z-10">
        <h1>Welcome to Ducki</h1>
      </div>
    </div>
  );
}
