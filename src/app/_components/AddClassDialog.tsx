'use client';

import { useState, useEffect } from 'react';
import Modal from 'react-modal';

type AddClassDialogProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onAddClass: (className: string) => void;
};

export default function AddClassDialog({
  isOpen,
  onRequestClose,
  onAddClass,
}: AddClassDialogProps) {
  const [className, setClassName] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const nextElement = document.getElementById('__next');
      if (nextElement) {
        Modal.setAppElement(nextElement);
      } else {
        console.error('Element with id "__next" not found');
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddClass(className);
    setClassName('');
    onRequestClose();
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
