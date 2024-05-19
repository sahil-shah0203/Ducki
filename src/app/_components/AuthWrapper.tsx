"use client";

import { useUser, SignOutButton } from '@clerk/nextjs';
import Sidebar from './Sidebar';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="flex justify-end p-4">
          <SignOutButton>
            <button className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">
              Sign Out
            </button>
          </SignOutButton>
        </header>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
