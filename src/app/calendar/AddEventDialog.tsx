import React, { useState, useEffect } from "react";

type Event = {
  title: string;
  start: Date;
  end: Date;
  place: string;
  description: string;
};

type AddEventDialogProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onAddEvent: (event: Event) => void;
  events: Event[];
};

const AddEventDialog = ({
                          isOpen,
                          onRequestClose,
                          onAddEvent,
                          events,
                        }: AddEventDialogProps) => {
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state when the dialog is opened
      setTitle("");
      setPlace("");
      setStart("");
      setEnd("");
      setDescription("");
      setErrorMessage(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startDateTime = new Date(start);
    const endDateTime = new Date(end);

    if (events.some(event => event.title.toLowerCase() === title.trim().toLowerCase())) {
      setErrorMessage("Event name already exists.");
    } else if (startDateTime >= endDateTime) {
      setErrorMessage("End time must be after start time.");
    } else {
      onAddEvent({ title: title.trim(), start: startDateTime, end: endDateTime, place: place.trim(), description: description.trim() });
      onRequestClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ${isOpen ? "" : "hidden"}`}
      style={{ zIndex: 1000 }}
    >
      <div className="rounded-md bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl text-black">Add a New Event</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-4 w-full rounded border p-2 text-black"
            placeholder="Event name"
            required
          />
          <input
            type="text"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            className="mb-4 w-full rounded border p-2 text-black"
            placeholder="Event place"
            required
          />
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="mb-4 w-full rounded border p-2 text-black"
            required
          />
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="mb-4 w-full rounded border p-2 text-black"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mb-4 w-full rounded border p-2 text-black"
            placeholder="Event description"
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
};

export default AddEventDialog;
