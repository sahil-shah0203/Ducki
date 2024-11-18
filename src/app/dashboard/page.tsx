"use client";
import { useUser } from "@clerk/nextjs";
import MainPage from "~/app/page";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";


export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user_id = searchParams.get("user");

  if (!user) {
    router.push("/");
  }

  const { data: sessions, error, isLoading } = user_id
    ? api.group.getSessionsByUserId.useQuery(
        { user_id: Number(user_id) },
        { enabled: !!user_id } // Ensures query only runs if user_id exists
      )
    : { data: undefined, error: undefined, isLoading: false };

  // list of sessions for the user sorted by due date
  const sortedSessions = sessions?.slice().sort((a, b) => {
    const dateA = new Date(a.due).getTime();
    const dateB = new Date(b.due).getTime();
    return dateA - dateB;
  });

  return (
    <div className="flex flex-row w-full h-screen">
      <MainPage/>
      <div className="w-full max-w-8xl p-4 z-10">
        <h1>Welcome to Ducki</h1>
      </div>
    </div>
  );
}
