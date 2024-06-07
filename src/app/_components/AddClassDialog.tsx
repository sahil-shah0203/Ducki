'use client';

import { useState } from 'react';
import Modal from 'react-modal';

type AddClassDialogProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onAddClass: (className: string) => boolean; // Change the return type to boolean
};

export default function AddClassDialog({
  isOpen,
  onRequestClose,
  onAddClass,
}: AddClassDialogProps) {
  const [className, setClassName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onAddClass(className);
    if (success) {
      setClassName('');
      setError(null);
      onRequestClose();
    } else {
      setError('Class already exists');
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
