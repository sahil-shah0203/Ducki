"use client";
import React from 'react';

export default function Home() {
  return (
    <div className="flex flex-col h-full justify-center items-center" style={{zIndex: -1}}>
      <div style={{
        position: 'relative',
        zIndex: 2 // Ensure the content is above the HomeBackground
      }}>
        lmao
      </div>
    </div>
  );
}
