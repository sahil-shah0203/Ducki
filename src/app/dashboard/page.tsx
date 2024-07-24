"use client";
import { useUser } from "@clerk/nextjs";
import {usePathname, useRouter} from "next/navigation";
import MainPage from "~/app/page";

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname()

  if (!user) {
    router.push("/");
  }

  if (pathname !== '/dashboard') {
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
