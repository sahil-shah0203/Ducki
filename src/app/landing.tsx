"use client";

import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Landing() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/main");
    }
  }, [isSignedIn, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-black font-bold mb-4">Hello, User!</h1>
      <div className="flex space-x-4">
        <SignUpButton>
          <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
            Create Account
          </button>
        </SignUpButton>
        <SignInButton>
          <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Sign In
          </button>
        </SignInButton>
      </div>
    </div>
  );
}
