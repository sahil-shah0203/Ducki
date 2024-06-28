'use client';

import { useEffect, useState } from 'react';
import Modal from 'react-modal';

type AddClassDialogProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onAddClass: (className: string) => boolean;
  classes: string[];
};

export default function AddClassDialog({
  isOpen,
  onRequestClose,
  onAddClass,
  classes,
}: AddClassDialogProps) {
  const [className, setClassName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Clear the state when the dialog closes
      setClassName('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (classes.includes(className)) {
      setError('Class already exists');
      return;
    }

    const success = onAddClass(className);
    if (success) {
      onRequestClose();
    } else {
      setError('Error adding class');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Add Class"
      className="modal"
      overlayClassName="overlay"
    >
      <h2 className="text-xl font-bold mb-4">Add a New Class</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="Class Name"
          className="border rounded py-1 px-2 mb-4 w-full"
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onRequestClose}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </form>
    </Modal>
  );
}
