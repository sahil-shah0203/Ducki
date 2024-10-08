import { useState, useRef, useEffect } from "react";
import { SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import Link from "next/link";

type ProfileDropdownProps = {
  userImage: string | undefined;
  userId: number | undefined;
};

export default function ProfileDropdown({
  userImage,
  userId,
}: ProfileDropdownProps) {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownRef]);

  return (
    <div className="absolute bottom-4 left-4 flex items-center">
      <img
        src={userImage}
        alt="Profile"
        className="h-10 w-10 cursor-pointer rounded-full"
        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
      />
      {isProfileDropdownOpen && (
        <div
          ref={profileDropdownRef}
          className="absolute bottom-12 left-0 z-20 w-48 overflow-hidden rounded-md bg-white shadow-xl"
        >
          <Link href={`/profile?userId=${userId}`} passHref>
            <button className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-200">
              Profile Settings
            </button>
          </Link>
          <SignOutButton>
            <button className="block w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-gray-200">
              Sign Out
            </button>
          </SignOutButton>
        </div>
      )}
    </div>
  );
}
