"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import MainPage from "~/app/page";
import { useState } from "react";
import GroupCards from "~/app/_components/GroupCards"; // Assuming similar to SessionCards for groups

export default function ClassPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const user_id = searchParams.get("user");

  const [error, setError] = useState<string | null>(null);

  if (!user) {
    router.push("/");
  }

  const user_id_number = Number(user_id);

  const handleGroupSelect = (groupId: string) => {
    // Navigate to the group page when a group is selected
    router.push(`/group/${groupId}`);
  };

  return (
    <div className="flex flex-row w-full h-screen">
      <MainPage />
      <div className="w-full max-w-8xl p-4 z-10">
        <GroupCards
          user_id={user_id_number}
          onGroupSelect={handleGroupSelect}
        />
      </div>
    </div>
  );
}
