import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import Link from "next/link";

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

interface SessionCardsProps {
  groupId: string;
  onSessionSelect: (sessionId: string) => void;
  user_id: number | undefined;
  selectedGroupName: string | null;
  selectedGroupID: number | undefined;
}

const SessionCard: React.FC<SessionCardProps> = ({
  sessionId,
  title,
  date,
  onClick,
}) => {
  const handleClick = () => {
    onClick(sessionId);
  };

  return (
    <div
      className="relative mt-10 cursor-pointer rounded-lg bg-[#eeeeee] p-4 shadow-md transition-shadow duration-200 hover:shadow-lg"
      style={{ width: "230px", height: "280px" }}
      onClick={handleClick}
    >
        <div
          className="mx-auto rounded-lg bg-white"
          style={{ padding: "10px"}}
        >
        <p className="text-sm ...">Session #1</p><p className="text-gray-400 text-xs ...">Date last accessed here</p>
        </div>
        <div
          className="mx-auto rounded-lg bg-white"
          style={{ padding: "10px", marginTop: "10px" }}
        >
        <p className="text-sm ...">Session #2</p><p className="text-gray-400 text-xs ...">Date last accessed here</p>
        </div>
        <div
          className="mx-auto rounded-lg bg-white"
          style={{ padding: "10px", marginTop: "10px" }}
        >
        <p className="text-sm ...">Session #3</p><p className="text-gray-400 text-xs ...">Date last accessed here</p>
        </div>
      <div className="absolute bottom-0 left-0 right-0">
        <div
          className="flex items-center justify-between rounded-b-lg rounded-t-none border border-gray-300 bg-white p-2"
          style={{ borderTopLeftRadius: "0", borderTopRightRadius: "0" }}
        >
          <div>
            <div className="text-lg font-semibold">{title}</div>
            <div className="text-gray-600">{date}</div>
          </div>
          <div className="text-gray-400"></div>
        </div>
      </div>
    </div>
  );
};

const SessionCards: React.FC<SessionCardsProps> = ({
  groupId,
  onSessionSelect,
  user_id,
  selectedGroupID,
  selectedGroupName,
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);

  const { data, error, isLoading } = api.session.getSessionsByGroupId.useQuery(
    { group_id: groupId },
    {
      enabled: !!groupId,
    },
  );

  useEffect(() => {
    if (data) {
      setSessions(data);
    } else if (error) {
      console.error("Error fetching sessions:", error);
    }
  }, [data, error]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading sessions: {error.message}</div>;

  return (
    <div className="grid grid-cols-1 overflow-auto md:grid-cols-2 lg:grid-cols-4">
      {sessions.map((session: Session) => (
        <Link
          href={`/classes/${selectedGroupID}/sessions/${session.id}?user=${user_id}&className=${selectedGroupName}&classID=${selectedGroupID}&sessionID=${session.id}`}
          key={session.id}
        >
          <SessionCard
            key={session.id}
            sessionId={session.id}
            title={session.title}
            date={session.date}
            onClick={onSessionSelect}
          />
        </Link>
      ))}
    </div>
  );
};

export default SessionCards;
