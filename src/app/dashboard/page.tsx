"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import MainPage from "~/app/page";

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();

  if (!user) {
    router.push("/");
    return null;
  }

  return (
    <div className="container">
      <MainPage />
      <div className="sidebar_category">
        <h1>Welcome to Ducki</h1>
      </div>
    </div>
  );
}
