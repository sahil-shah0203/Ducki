"use client";
import { useUser } from '@clerk/nextjs';
import Landing from './landing';
import Home from './home'; 

import { api } from "~/trpc/server"

export default function MainPage() {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return <Landing />;
  }

  return <Home />;

}
