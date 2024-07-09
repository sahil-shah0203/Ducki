import dynamic from 'next/dynamic';
import React from 'react';
import MainPage from '../page';

const Settings = dynamic(() => import('~/app/ProfileSettings'), {
  ssr: false,
});

const ProfileSettings = () => {
  return (
    <div className="container">
      <MainPage />
      <div className="sidebar_category">
        <Settings />
      </div>
    </div>
  );
};

export default ProfileSettings;
