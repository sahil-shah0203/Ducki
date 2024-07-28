"use client";

import React, { useState } from "react";
import { usePathname } from 'next/navigation';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import MainPage from '~/app/page';
import AddEventDialog from '~/app/calendar/addEventDialog';  // Import the new component

const localizer = momentLocalizer(moment);

const CalendarPage: React.FC = () => {
  const pathname = usePathname();
  const [events, setEvents] = useState([]);
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
