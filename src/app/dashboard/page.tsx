import dynamic from 'next/dynamic';
import React from 'react';
import MainPage from '../page';

const Home = dynamic(() => import('~/app/_components/sidebar_components/dashboard'), {
  ssr: false,
});

const CalendarPage = () => {
  return (
    <div className="container">
      <MainPage />
      <div className="sidebar_category">
        <Home />
      </div>
    </div>
  );
};

export default CalendarPage;
