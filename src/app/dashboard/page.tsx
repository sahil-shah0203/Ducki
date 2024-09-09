"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import MainPage from "~/app/page";

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();

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
