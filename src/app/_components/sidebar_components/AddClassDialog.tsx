import { useState, useEffect } from "react";

type AddClassDialogProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onAddClass: (classTemp: string) => Promise<boolean>;
  classes: { class_id: number; class_name: string }[];
};

export default function AddClassDialog({
  isOpen,
  onRequestClose,
  onAddClass,
  classes,
}: AddClassDialogProps) {
  const [newClass, setNewClass] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state when the dialog is opened
      setNewClass("");
      setErrorMessage(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const classExists = classes.some(
      (classItem) =>
        classItem.class_name.toLowerCase() === newClass.trim().toLowerCase(),
    );

    if (classExists) {
      setErrorMessage("Class name already exists.");
    } else {
      if (await onAddClass(newClass.trim())) {
        setNewClass("");
        onRequestClose();
        setErrorMessage(null);
      } else {
        setErrorMessage("Failed to add class. Please try again.");
      }
    }
  };

  return (
    <div
      style={{ zIndex: 9999 }}
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ${isOpen ? "" : "hidden"}`}
    >
      <div className="rounded-md bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl text-black">Add a New Class</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={newClass}
            onChange={(e) => setNewClass(e.target.value)}
            className="mb-4 w-full rounded border p-2 text-black"
            placeholder="Class name"
            required
          />
          {errorMessage && <p className="mb-4 text-red-500">{errorMessage}</p>}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onRequestClose}
              className="mr-4 rounded border-2 border-[#437557] bg-white px-4 py-2 text-[#437557] hover:bg-[#d3d3d3]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-[#437557] px-4 py-2 text-white hover:bg-[#417154]"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
