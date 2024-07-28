'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import MainPage from '~/app/page';

const localizer = momentLocalizer(moment);

const CalendarPage: React.FC = () => {
  const pathname = usePathname()
  const [events, setEvents] = useState([]);

  if (pathname !== '/calendar') {
    return null;
  }

  return (
    <div className="container">
      <MainPage/>
      <div className="sidebar_category">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '90%', width: '100%' }}
        />
      </div>
    </div>
  );
};

export default CalendarPage;