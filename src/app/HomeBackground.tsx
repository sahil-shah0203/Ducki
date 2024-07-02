import React from 'react';

const HomeBackground: React.FC = () => {
  return (
    <div style={outerContainerStyle}>
      <div style={innerContainerStyle} />
    </div>
  );
};

const outerContainerStyle: React.CSSProperties = {
  position: 'absolute',
  top: -10,
  left: 100,
  width: '96%',
  height: '99%',
  display: 'flex',
  justifyContent: 'right',
  alignItems: 'center',
  backgroundColor: 'transparent',
  zIndex: -1,
};

const innerContainerStyle: React.CSSProperties = {
  width: '95%',
  height: '90%',
  backgroundColor: 'white',
  borderRadius: '1rem',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  boxSizing: 'border-box',
};

export default HomeBackground;
