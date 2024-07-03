"use client";
import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center pointer-events-none z-[-1]">
      <div className="w-[90%] h-[95vh] flex justify-center items-center">
        <div className="w-[95%] h-[90%] bg-white rounded-lg shadow-md"></div>
      </div>
    </div>
  );
};

export default Background;
