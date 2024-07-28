"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import MainPage from '~/app/page';

const localizer = momentLocalizer(moment);

type AddEventDialogProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onAddEvent: (event: { title: string; start: Date; end: Date; place: string }) => void;
  events: { title: string; start: Date; end: Date; place: string }[];
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state when the dialog is opened
      setTitle("");
      setPlace("");
      setStart("");
      setEnd("");
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
      onAddEvent({ title: title.trim(), start: startDateTime, end: endDateTime, place: place.trim() });
      onRequestClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ${isOpen ? "" : "hidden"}`}
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

const CalendarPage: React.FC = () => {
  const pathname = usePathname();
  const [events, setEvents] = useState([
    {
      title: 'Meeting',
      start: new Date(2024, 6, 28, 10, 0), // July 28, 2024 at 10:00 AM
      end: new Date(2024, 6, 28, 11, 30), // July 28, 2024 at 11:30 AM
      place: 'Office' // Added place for the event
    }
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (pathname !== '/calendar') {
    return null;
  }

  const handleSelectSlot = () => {
    setIsDialogOpen(true);
  };

  const handleAddEvent = (event) => {
    setEvents([...events, event]);
  };

  return (
    <div className="container">
      <MainPage />
      <div className="sidebar_category">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={handleSelectSlot}
          style={{ height: '90%', width: '100%' }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: '#3174ad',
              borderRadius: '5px',
              opacity: 0.8,
              color: 'white',
              border: '0px',
              display: 'block'
            }
          })}
          components={{
            event: ({ event }) => (
              <span>
                <strong>{event.title}</strong>
                <br />
                {event.place}
              </span>
            )
          }}
        />
      </div>
      <AddEventDialog
        isOpen={isDialogOpen}
        onRequestClose={() => setIsDialogOpen(false)}
        onAddEvent={handleAddEvent}
        events={events}
      />
    </div>
  );
};

export default CalendarPage;
