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
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4">Session Complete</h2>
        <p className="mb-4">
          Your session is now complete. Would you like to schedule review sessions?
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
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          onClick={() => onClose(selectedDays)} // Pass selected days array to onClose
        >
          Schedule
        </button>
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={() => onClose([])} // Pass an empty array to indicate no scheduling
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SessionEndDialog;
