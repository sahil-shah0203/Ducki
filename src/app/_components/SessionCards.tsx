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
  onClick: (sessionId: string) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ sessionId, title, date, onClick }) => {
  const handleClick = () => {
    onClick(sessionId);
  };

  return (
    <div
      className="bg-[#e2e9e5] rounded-lg shadow-md p-4 mt-10 cursor-pointer hover:shadow-lg transition-shadow duration-200 relative"
      style={{ width: '230px', height: '280px' }}
      onClick={handleClick}
    >
      <div className="bg-white rounded-lg mx-auto" style={{ width: '85%', height: '100%' }}></div>
      <div className="absolute bottom-0 left-0 right-0">
        <div className="bg-white border border-gray-300 rounded-t-none rounded-b-lg p-2 flex justify-between items-center" style={{ borderTopLeftRadius: '0', borderTopRightRadius: '0'}}>
          <div>
            <div className="text-lg font-semibold">{title}</div>
            <div className="text-gray-600">{date}</div>
          </div>
          <div className="text-gray-400">
            {/* Optional icon can be placed here */}
          </div>
        </div>
      </div>
    </div>
  );
};

interface SessionCardsProps {
  classId: number;
  onSessionSelect: (sessionId: string) => void;
}

const SessionCards: React.FC<SessionCardsProps> = ({ classId, onSessionSelect }) => {
  const [sessions, setSessions] = useState<Session[]>([]);

  const { data, error, isLoading } = api.session.getSessionsByClassId.useQuery(
    { class_id: classId },
    {
      enabled: !!classId,
    }
  );

  useEffect(() => {
    if (data) {
      console.log('Fetched sessions:', data);
      setSessions(data);
    } else if (error) {
      console.error('Error fetching sessions:', error);
    }
  }, [data, error]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading sessions: {error.message}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 overflow-auto">
      {sessions.map((session: Session) => (
        <SessionCard
          key={session.id}
          sessionId={session.id}
          title={session.title} // This should display the session title
          date={session.date}
          onClick={onSessionSelect}
        />
      ))}
    </div>
  );
};

export default SessionCards;
