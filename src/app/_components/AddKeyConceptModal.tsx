import { useState } from "react";
import { FaTimes } from "react-icons/fa";

interface AddKeyConceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (description: string) => void;
}

export const AddKeyConceptModal = ({
  isOpen,
  onClose,
  onSave,
}: AddKeyConceptModalProps) => {
  const [description, setDescription] = useState("");

  const handleSave = () => {
    onSave(description);
    setDescription("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add Key Concept</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded border p-2"
          rows={4}
          placeholder="Enter key concept description"
        ></textarea>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="rounded bg-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
