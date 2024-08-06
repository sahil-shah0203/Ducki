// components/SessionEndDialog.tsx

import React from "react";

interface SessionEndDialogProps {
  isOpen: boolean;
  onClose: (scheduleReview: boolean) => void; // Update to pass scheduleReview flag
}

const SessionEndDialog: React.FC<SessionEndDialogProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"> {/* Updated z-index to ensure dialog overlays other content */}
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4">Session Complete</h2>
        <p className="mb-4">
          Your session is now complete. Would you like to schedule review sessions?
        </p>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          onClick={() => onClose(true)} // Pass true to schedule reviews
        >
          Yes
        </button>
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={() => onClose(false)} // Pass false to just close the dialog
        >
          No
        </button>
      </div>
    </div>
  );
};

export default SessionEndDialog;
