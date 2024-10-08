import React from "react";
import { api } from "~/trpc/react";

type Event = {
  event_id: number;
  title: string;
  description: string | null;
  start: Date;
  end: Date;
  user_id: number;
  place: string | null;
};

type EventDetailsDialogProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  event: Event | null;
  onDeleteEvent: (event_id: number) => void;
};

const EventDetailsDialog = ({ isOpen, onRequestClose, event, onDeleteEvent }: EventDetailsDialogProps) => {
  const deleteEventMutation = api.events.removeEvent.useMutation({
    onSuccess: () => {
      if (event) {
        onDeleteEvent(event.event_id);
      }
      onRequestClose();
    },
    onError: (error) => {
      alert(`Error deleting event: ${error.message}`);
    },
  });

  if (!event) return null;

  const handleDelete = () => {
    if (event) {
      deleteEventMutation.mutate({
        user_id: event.user_id,
        event_id: event.event_id,
      });
    }
  };

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
        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={handleDelete}
            className="rounded bg-[#407855] px-4 py-2 text-white hover:bg-[#7c9c87]"
          >
            Delete
          </button>
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
