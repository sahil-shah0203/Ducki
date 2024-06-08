'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function ProfileSettings() {
  const { user } = useUser();
  const router = useRouter();

  if (!user) {
    router.push('/'); // Redirect to home or login page if the user is not signed in
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Profile & Settings</h1>
      <div className="bg-white p-4 rounded shadow-md">
        <h2 className="text-2xl mb-2">My Profile</h2>
        <p><strong>Name:</strong> {user.fullName}</p>
        <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
        {/* Add more profile settings here */}
      </div>
    </div>
  );
}
