'use client'; // Ensure this is a client component

import { useState, useRef, useEffect } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { isSignedIn, user } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  if (!isSignedIn) {
    return null;
  }

  const handleProfileSettings = () => {
    router.push('/ProfileSettings'); // Adjust the path if necessary
  };

  const handleHomeNavigation = () => {
    router.push('/'); // Navigate to the home page
  };

  return (
    <div className="flex justify-between items-center p-4 bg-gray-800 text-white fixed w-full top-0">
      <div className="flex items-center space-x-4">
        {/* Placeholder for logo */}
        <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
        <h1 className="text-2xl font-bold">Ducki</h1>
      </div>
      <div className="relative">
        <img
          src={user?.imageUrl}
          alt="Profile"
          className="w-8 h-8 rounded-full cursor-pointer"
          onClick={handleDropdownToggle}
        />
        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-48 bg-white rounded-md overflow-hidden shadow-xl z-10"
          >
            <button
              onClick={handleProfileSettings}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full text-left"
            >
              My Profile
            </button>
            <button
              onClick={handleProfileSettings}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full text-left"
            >
              Settings
            </button>
            <button
              onClick={handleHomeNavigation}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full text-left"
            >
              Home
            </button>
            <SignOutButton>
              <button className="block px-4 py-2 text-sm text-red-700 hover:bg-gray-200 w-full text-left">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        )}
      </div>
    </div>
  );
}
