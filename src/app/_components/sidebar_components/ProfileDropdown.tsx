import { useState, useRef, useEffect } from "react";
import { SignOutButton } from '@clerk/nextjs';

type ProfileDropdownProps = {
  userImage: string | undefined;
};

export default function ProfileDropdown({ userImage }: ProfileDropdownProps) {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownRef]);

  const handleProfileSettings = () => {
    // Add navigation logic for profile settings here
  };

  const handleHomeNavigation = () => {
    // Add navigation logic for home page here
  };

  return (
    <div className="absolute bottom-4 left-4 flex items-center">
      <img
        src={userImage}
        alt="Profile"
        className="w-10 h-10 rounded-full cursor-pointer"
        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
      />
      {isProfileDropdownOpen && (
        <div
          ref={profileDropdownRef}
          className="absolute left-0 bottom-12 w-48 bg-white rounded-md overflow-hidden shadow-xl z-20"
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
  );
}
