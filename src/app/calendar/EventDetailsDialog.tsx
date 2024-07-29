import React from "react";

type Event = {
  title: string;
  start: Date;
  end: Date;
  place: string;
  description: string;
};

type EventDetailsDialogProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  event: Event | null;
};

const EventDetailsDialog = ({ isOpen, onRequestClose, event }: EventDetailsDialogProps) => {
  if (!event) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ${isOpen ? "" : "hidden"}`}
      style={{ zIndex: 1000 }}
    >
      <div className="rounded-md bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl text-black">Event Details</h2>
        <p><strong>Title:</strong> {event.title}</p>
        <p><strong>Place:</strong> {event.place}</p>
        <p><strong>Start:</strong> {event.start.toString()}</p>
        <p><strong>End:</strong> {event.end.toString()}</p>
        <p><strong>Description:</strong> {event.description}</p>
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={onRequestClose}
            className="rounded border-2 border-[#437557] bg-white px-4 py-2 text-[#437557] hover:bg-[#d3d3d3]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsDialog;
