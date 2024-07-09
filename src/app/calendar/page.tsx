import dynamic from 'next/dynamic';
import React from 'react';
import MainPage from '../page';

const MyCalendar = dynamic(() => import('~/app/_components/sidebar_components/calendar'), {
  ssr: false,
});

const CalendarPage = () => {
  return (
    <div className="container">
      <MainPage />
      <div className="myCalendar">
        <MyCalendar />
      </div>
    </div>
  );
};

export default CalendarPage;
