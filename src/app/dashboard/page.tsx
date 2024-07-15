"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function ProfileSettings() {
  const { user } = useUser();
  const router = useRouter();

  if (!user) {
    router.push("/"); // Redirect to home or login page if the user is not signed in
    return null;
  }

  const home = () => {
    router.push("/");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-3xl font-bold">Dashboard</h1>
      <div className="rounded bg-white p-4 shadow-md">
      </div>
      <button onClick={home}>Home</button>
    </div>
  );
}
