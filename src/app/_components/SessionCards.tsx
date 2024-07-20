"use client";
import React from 'react';
// import { useRouter } from 'next/router';

interface SessionCardProps {
  sessionId: string;
  title: string;
  date: string;
}

const SessionCard: React.FC<SessionCardProps> = ({ sessionId, title, date }) => {
  // const router = useRouter();

  const handleClick = () => {
    // router.push(`/session/${sessionId}`); // Update this route based on your routing logic
    alert("This works! Please add a route here soon -Sahil");
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleClick}
    >
      <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
      <div className="text-lg font-semibold">{title}</div>
      <div className="text-gray-600">{date}</div>
    </div>
  );
};

interface SessionCardsProps {
  sessions: { id: string; title: string; date: string }[];
}

const SessionCards: React.FC<SessionCardsProps> = ({ sessions }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-auto">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          sessionId={session.id}
          title={session.title}
          date={session.date}
        />
      ))}
    </div>
  );
};

export default SessionCards;
