import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

type AddClassDialogProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onAddClass: (
    classTemp: string,
    semesterId: number | null,
    newSemesterName?: string
  ) => Promise<boolean>;
  semesters: { semester_id: number; semester_name: string }[];
};

export default function AddClassDialog({
                                         isOpen,
                                         onRequestClose,
                                         onAddClass,
                                         semesters,
                                       }: AddClassDialogProps) {
  const [newClass, setNewClass] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [newSemesterName, setNewSemesterName] = useState<string>("");
  const [isCreatingNewSemester, setIsCreatingNewSemester] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset state when the dialog is opened
      setNewClass("");
      setErrorMessage(null);
      setSelectedSemester(null);
      setNewSemesterName("");
      setIsCreatingNewSemester(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newClass.trim() === "") {
      setErrorMessage("Class name cannot be empty.");
      return;
    }

    if (selectedSemester === null && newSemesterName.trim() === "") {
      setErrorMessage("Please select or create a semester.");
      return;
    }

    if (
      await onAddClass(
        newClass.trim(),
        selectedSemester,
        isCreatingNewSemester ? newSemesterName.trim() : undefined,
      )
    ) {
      setNewClass("");
      setSelectedSemester(null);
      setNewSemesterName("");
      onRequestClose();
      setErrorMessage(null);
    } else {
      setErrorMessage("Failed to add class. Please try again.");
    }
  };

  const handleSemesterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === "new") {
      setIsCreatingNewSemester(true);
      setSelectedSemester(null); // Unset selected semester
    } else {
      setIsCreatingNewSemester(false);
      setSelectedSemester(Number(selectedValue) || null);
    }
  };

  const dialogContent = (
    <div
      style={{ zIndex: 9999 }}
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ${
        isOpen ? "" : "hidden"
      }`}
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
          <select
            value={selectedSemester ?? ""}
            onChange={handleSemesterChange}
            className="mb-4 w-full rounded border p-2 text-black"
          >
            <option value="">Select Semester</option>
            {semesters.map((semester) => (
              <option
                key={semester.semester_id}
                value={semester.semester_id}
              >
                {semester.semester_name}
              </option>
            ))}
            <option value="new">Create New Semester</option>
          </select>

          {isCreatingNewSemester && (
            <input
              type="text"
              value={newSemesterName}
              onChange={(e) => setNewSemesterName(e.target.value)}
              className="mb-4 w-full rounded border p-2 text-black"
              placeholder="New Semester Name"
              required
            />
          )}
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

  // Render the dialog content via a React Portal
  return isOpen ? createPortal(dialogContent, document.body) : null;
}
