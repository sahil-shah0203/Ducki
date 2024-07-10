"use client"; // Add this at the top

import dynamic from "next/dynamic";
import React from "react";
import { useSearchParams } from "next/navigation";
import MainPage from "../page";

const Settings = dynamic(() => import("~/app/ProfileSettings"), {
  ssr: true,
});

const ProfileSettingsPage = () => {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const numericUserId = userId ? parseInt(userId, 10) : null;

  return (
    <div className="container">
      <MainPage />
      <div className="sidebar_category">
        <Settings userId={numericUserId} />
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
