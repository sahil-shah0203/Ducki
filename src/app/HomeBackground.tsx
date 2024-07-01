import React from 'react';

const HomeBackground: React.FC = () => {
  return (
    <div style={{
      position: 'absolute',
      top: '2.5vh', // Relative to viewport height
      left: '9vw', // Relative to viewport width
      right: '-0.5vw', // Relative to viewport width
      bottom: '-0.5vh', // Relative to viewport height
      backgroundColor: 'white',
      borderRadius: '1rem', // Use rem for better scaling with font size
      boxSizing: 'border-box',
      zIndex: -1, // Ensure it overlays the green background
      padding: '0rem' // Use rem for better scaling with font size
    }} />
  );
};

export default HomeBackground;
