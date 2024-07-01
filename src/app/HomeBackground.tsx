import React from 'react';

const HomeBackground: React.FC = () => {
  return (
    <div style={{
      position: 'absolute',
      top: '2.5vh', // Relative to viewport height
      left: '20vw', // Adjusted for the sidebar width, assuming sidebar takes 20% of viewport width
      width: '75vw', // Adjust width to be proportional
      height: '90vh', // Adjust height to be proportional
      backgroundColor: 'white',
      borderRadius: '1rem', // Use rem for better scaling with font size
      boxSizing: 'border-box',
      zIndex: -1, // Ensure it overlays the green background
      padding: '0rem' // Use rem for better scaling with font size
    }} />
  );
};

export default HomeBackground;
