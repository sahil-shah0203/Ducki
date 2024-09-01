import React, { useState } from "react";

interface SessionEndDialogProps {
  isOpen: boolean;
  onClose: (selectedDays: number[]) => void; // Pass an array of selected days
}

const SessionEndDialog: React.FC<SessionEndDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  if (!isOpen) return null;

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleCancel = () => {
    setSelectedDays([]); // Clear any selected days
    onClose([]); // Just close the dialog
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">Session Complete</h2>
        <p className="mb-4">
          Your session is now complete. Would you like to schedule review
          sessions?
        </p>
        <div className="mb-4">
          <label className="block">
            <input
              type="checkbox"
              checked={selectedDays.includes(1)}
              onChange={() => toggleDay(1)}
            />
            1 Day Later
          </label>
          <label className="block">
            <input
              type="checkbox"
              checked={selectedDays.includes(3)}
              onChange={() => toggleDay(3)}
            />
            3 Days Later
          </label>
          <label className="block">
            <input
              type="checkbox"
              checked={selectedDays.includes(6)}
              onChange={() => toggleDay(6)}
            />
            6 Days Later
          </label>
        </div>
        <button
          className="mr-2 rounded bg-blue-500 px-4 py-2 text-white"
          onClick={() => onClose(selectedDays)} // Pass selected days array to onClose
        >
          Schedule
        </button>
        <button
          className="rounded bg-gray-500 px-4 py-2 text-white"
          onClick={handleCancel} // Only close the dialog
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SessionEndDialog;
