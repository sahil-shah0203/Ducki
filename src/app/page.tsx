"use client";
import { useUser } from "@clerk/nextjs";
import Home from "./home";
import Sidebar from "./_components/sidebar_components/Sidebar";
import React, { useState } from "react";
import Background from "./Background";
import HomeBackground from "~/app/HomeBackground";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

export default function MainPage() {
  const { user, isSignedIn } = useUser();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const router = useRouter();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (!isSignedIn) {
    router.push("/login");
  } else {
    const user_email = user?.emailAddresses[0]?.emailAddress;
    const first_name = user?.firstName;
    const last_name = user?.lastName;
    const user_image = user?.imageUrl;

    if (!user_email || !first_name || !last_name) {
      return <div>Error: Unable to fetch user details</div>;
    }

    const {
      data: userData,
      error,
      isLoading,
    } = api.user.getUserByEmail.useQuery({
      email: user_email,
      firstName: first_name,
      lastName: last_name,
    });

    if (isLoading) {
      return (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      );
    }

    if (error) {
      return <div>Error: {error.message}</div>;
    }

    const user_id = userData?.user_id;

    return (
      <div className="relative flex h-screen" style={{ zIndex: 0 }}>
        <Sidebar
          userId={user_id}
          toggleSidebar={toggleSidebar}
          isCollapsed={isSidebarCollapsed}
          userImage={user_image}
          user_id={user_id}
        />
        <div
          className={`flex-grow transition-all duration-300 ${isSidebarCollapsed ? "ml-10" : "ml-64"}`}
        >
          <Background />
          <HomeBackground isCollapsed={isSidebarCollapsed} />
          <Home />
        </div>
      </div>
    );
  }
}
