import { useState } from 'react';

interface UserInputProps {
  onFetchResults: (user: any) => void;
  onError: (error: string | null) => void;
}

export default function UserInput({ onFetchResults, onError }: UserInputProps) {
  const [email, setEmail] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  const handleSubmit = async () => {
    onError(null);
    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      onFetchResults(result);
    } catch (err) {
      console.error("Error creating user:", err);
      onError("Failed to create user.");
    }
  };

  return (
    <div className="p-4 flex flex-col w-full">
      <input
        type="text"
        className="border rounded py-1 px-2 mb-2 text-black"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First Name"
        aria-label="First Name"
      />
      <input
        type="text"
        className="border rounded py-1 px-2 mb-2 text-black"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Last Name"
        aria-label="Last Name"
      />
      <input
        type="email"
        className="border rounded py-1 px-2 mb-2 text-black"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        aria-label="Email"
      />
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded"
        onClick={handleSubmit}
        aria-label="Submit user data"
      >
        Submit
      </button>
    </div>
  );
}
