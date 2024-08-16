import React from "react";
import { createPortal } from "react-dom";

interface ConfirmDeleteDialogProps {
  className: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteDialog({
                                              className,
                                              onCancel,
                                              onConfirm,
                                            }: ConfirmDeleteDialogProps) {
  const dialogContent = (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      style={{ zIndex: 9999 }}
    >
      <div className="rounded-md bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl text-black">
          Are you sure you want to delete {className}?
        </h2>
        <div className="flex justify-end">
          <button
            onClick={onCancel}
            className="mr-4 rounded border-2 border-[#437557] bg-white px-4 py-2 text-[#437557] hover:bg-[#cccccc]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded bg-[#407855] px-4 py-2 text-white hover:bg-[#7c9c87]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
}
