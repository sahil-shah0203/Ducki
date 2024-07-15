"use client";

import { useUser } from '@clerk/nextjs';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
