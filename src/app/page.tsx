'use client';

import { useUser } from '@clerk/nextjs';
import Landing from './landing';
import Home from './home';
import Sidebar from './_components/Sidebar';

export default function MainPage() {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return <Landing />;
  }

  return (
    <div className="flex h-full min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Home />
      </div>
    </div>
  );
}
