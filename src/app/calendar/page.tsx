"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import MainPage from '~/app/page';
import AddEventDialog from '~/app/calendar/AddEventDialog';
import EventDetailsDialog from '~/app/calendar/EventDetailsDialog';
import { api } from "~/trpc/react";

const localizer = momentLocalizer(moment);

type Event = {
  title: string;
  start: Date;
  end: Date;
  place: string;
  description: string | null;
};

type CalendarPageProps = {
  user_id: number;
};

const CalendarPage: React.FC<CalendarPageProps> = ({ user_id }) => {
  const pathname = usePathname();
  const [events, setEvents] = useState<Event[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const { data, isLoading, error } = api.events.getEventsByUserId.useQuery({ user_id: userId });

  useEffect(() => {
    if (data) {
      setEvents(data.map(event => ({
        user_id: user_id,
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        place: event.place,
        description: event.description,
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

  if (isLoading) {
    return <div>Loading events...</div>;
  }

  if (error) {
    return <div>Error loading events: {error.message}</div>;
  }

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
          onSelectEvent={handleSelectEvent}
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
        isOpen={isAddDialogOpen}
        onRequestClose={() => setIsAddDialogOpen(false)}
        onAddEvent={handleAddEvent}
        events={events}
      />
      <EventDetailsDialog
        isOpen={isDetailsDialogOpen}
        onRequestClose={() => setIsDetailsDialogOpen(false)}
        event={selectedEvent}
      />
    </div>
  );
};

export default CalendarPage;
