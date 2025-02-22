"use client";
import React from 'react';

const HomeBackground: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
  return (
    <div className={`fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center pointer-events-none z-[-1] transition-all duration-300 ${isCollapsed ? 'ml-10' : 'ml-64'}`}>
      <div className="w-[calc(100%-2rem)] h-[calc(100%-2rem)] bg-white rounded-lg shadow-md flex justify-center items-center"></div>
    </div>
  );
};

export default HomeBackground;
