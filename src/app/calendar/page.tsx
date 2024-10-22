"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useSearchParams } from 'next/navigation';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import MainPage from '~/app/page';
import AddEventDialog from '~/app/calendar/AddEventDialog';
import EventDetailsDialog from '~/app/calendar/EventDetailsDialog';
import { api } from "~/trpc/react";
import CustomToolbar from '~/app/calendar/CustomToolbar';

const localizer = momentLocalizer(moment);

type Event = {
  event_id: number;
  title: string;
  description: string | null;
  start: Date;
  end: Date;
  user_id: number;
  place: string | null;
};

const CalendarPage: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const userId = Number(searchParams.get('user_id'));
  const { data, isLoading, error } = api.events.getEventsByUserId.useQuery({ user_id: userId });
  console.log("Fetched Events from calendar:", data);
  useEffect(() => {
    if (data) {
      setEvents(data.map(event => ({
        event_id: event.event_id,
        title: event.title,
        description: event.description,
        start: new Date(event.start),
        end: new Date(event.end),
        user_id: event.user_id,
        place: event.place,
      })));
    }
  }, [data]);

  if (pathname !== '/calendar') {
    return null;
  }

  const handleSelectSlot = () => {
    setIsAddDialogOpen(true);
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsDetailsDialogOpen(true);
  };

  const handleAddEvent = (event: Event) => {
    setEvents([...events, event]);
  };

  const handleDeleteEvent = (event_id: number) => {
    setEvents(events.filter(event => event.event_id !== event_id));
  };

  if (isLoading) {
    return <div>Loading events...</div>;
  }

  if (error) {
    return <div>Error loading events: {error.message}</div>;
  }

  return (
    <div className="flex flex-row w-full h-screen">
      <MainPage />
      <div className="w-full max-w-8xl p-4 z-10">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          style={{ height: '90vh', width: '100%' }}
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
            toolbar: CustomToolbar,
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
        isOpen={isAddDialogOpen}
        onRequestClose={() => setIsAddDialogOpen(false)}
        onAddEvent={handleAddEvent}
        events={events}
        user_id={userId}
      />
      <EventDetailsDialog
        isOpen={isDetailsDialogOpen}
        onRequestClose={() => setIsDetailsDialogOpen(false)}
        event={selectedEvent}
        onDeleteEvent={handleDeleteEvent}
      />
    </div>
  );
};

export default CalendarPage;
