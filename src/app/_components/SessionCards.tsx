import React, { useEffect, useState } from 'react';
import { api } from '~/trpc/react';

interface Session {
  id: string;
  title: string;
  date: string;
}

interface SessionCardProps {
  sessionId: string;
  title: string;
  date: string;
}

const SessionCard: React.FC<SessionCardProps> = ({ sessionId, title, date }) => {
  const handleClick = () => {
    alert(`Session ID: ${sessionId}\nTitle: ${title}\nDate: ${date}`);
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
  classId: number;
}

const SessionCards: React.FC<SessionCardsProps> = ({ classId }) => {
  const [sessions, setSessions] = useState<Session[]>([]);

  const { data, error, isLoading } = api.session.getSessionsByClassId.useQuery(
    { class_id: classId },
    {
      enabled: !!classId,
    }
  );

  useEffect(() => {
    if (data) {
      console.log('Fetched sessions:', data); // Add this line
      setSessions(data);
    } else if (error) {
      console.error('Error fetching sessions:', error); // Add this line
    }
  }, [data, error]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading sessions: {error.message}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-auto">
      {sessions.map((session: Session) => (
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
