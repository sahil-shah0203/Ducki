"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";

type ProfileSettingsProps = {
  userId: number | null;
};

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ProfileSettings({ userId }: ProfileSettingsProps) {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
    }
  }, [user]);

  const deleteUser = api.user.deleteUser.useMutation();

  if (!user) {
    router.push("/"); // Redirect to home or login page if the user is not signed in
    return null;
  }

  if (pathname !== "/settings") {
    return null; // Do not render if the current URL is not /settings
  }

  const handleDeleteAccount = () => {
    if (userId) {
      deleteUser.mutate(
        { userId },
        {
          onSuccess: () => {
            console.log("User deleted successfully");
            signOut(); // Log the user out after successful account deletion
            router.push("/"); // Redirect to home page after logging out
          },
          onError: (error) => {
            console.error("Error deleting user:", error);
          },
        },
      );
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Profile & Settings</h1>
      <div className="rounded bg-white p-4 shadow-md">
        <h2 className="mb-4 text-2xl font-semibold">My Profile</h2>
        <div className="mb-4">
          <label
            className="mb-2 block text-sm font-bold text-gray-700"
            htmlFor="firstName"
          >
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            readOnly
            className="focus:shadow-outline w-full cursor-not-allowed appearance-none rounded border bg-gray-100 px-3 py-2 leading-tight text-gray-500 shadow focus:outline-none"
          />
        </div>
        <div className="mb-4">
          <label
            className="mb-2 block text-sm font-bold text-gray-700"
            htmlFor="lastName"
          >
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            readOnly
            className="focus:shadow-outline w-full cursor-not-allowed appearance-none rounded border bg-gray-100 px-3 py-2 leading-tight text-gray-500 shadow focus:outline-none"
          />
        </div>
        <div className="mb-4">
          <label
            className="mb-2 block text-sm font-bold text-gray-700"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={user.primaryEmailAddress?.emailAddress}
            readOnly
            className="focus:shadow-outline w-full cursor-not-allowed appearance-none rounded border bg-gray-100 px-3 py-2 leading-tight text-gray-500 shadow focus:outline-none"
          />
        </div>
      </div>
      <button
        onClick={openModal}
        className="mt-4 w-full rounded bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 focus:outline-none"
      >
        Delete Account
      </button>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-4">
        <h2 className="mb-4 text-xl font-semibold">Confirm Deletion</h2>
        <p className="mb-4">Are you sure you want to delete your account? This action cannot be undone.</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="rounded bg-gray-300 px-4 py-2 font-bold text-black hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

