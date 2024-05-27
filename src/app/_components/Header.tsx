'use client'; // Ensure this is a client component

import { useUser, SignOutButton } from '@clerk/nextjs';

export default function Header() {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return null;
  }

  return (
      <div className="flex justify-between items-center p-4 bg-gray-800 text-white fixed w-full top-0">
          <div className="flex items-center space-x-4">
              {/* Placeholder for logo */}
              <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
              <h1 className="text-2xl font-bold">Ducki</h1>
          </div>
          <SignOutButton>
              <button className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">
                  Sign Out
              </button>
          </SignOutButton>
      </div>
  );
}
