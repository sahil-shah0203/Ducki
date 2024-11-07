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
  onSessionSelect: (sessionId: string) => void;
  user_id: number | undefined;
  selectedGroupID: string | null;
  selectedClassName: string | null;
  selectedClassID: string | null;
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
      className="w-[325px] h-[206.14px] justify-center items-center inline-flex cursor-pointer"
      onClick={handleClick}
    >
      <div className="w-[325px] h-[206.28px] relative">
        <div className="w-[325px] h-[206px] left-0 top-0 absolute bg-white rounded" />
        <div className="w-[325px] h-[199.28px] left-0 top-[7px] absolute">
          <div className="w-[307px] h-[110px] left-[9px] top-[110px] absolute opacity-50 bg-[#f3f5f4] rounded-[10px]" />
          <div className="w-[325px] h-[81.28px] left-[-0px] top-[118px] absolute bg-white rounded-bl rounded-br" />
          <div className="w-[293.90px] h-[55.60px] left-[16px] top-[128px] absolute flex-col justify-start items-start gap-1 inline-flex">
            <div className="self-stretch justify-start items-center gap-1 inline-flex">
              <div className="w-[261px] h-[26px] text-[#669880] text-2xl font-medium font-['DM Sans'] leading-[27px]">
                {title}
              </div>
            </div>
            <div className="self-stretch h-[25.60px] text-[#bcc7c1] text-base font-medium font-['DM Sans']">
              {date}
            </div>
          </div>
        </div>
        <div className="w-[293px] h-[101px] left-[16px] top-[7px] absolute opacity-50 justify-center items-center gap-1 inline-flex">
          <div className="w-[19px] h-[22px] origin-top-left -rotate-90 bg-[#d8dedb] rounded-md" />
          <div className="w-[19px] h-[71px] origin-top-left rotate-90 bg-[#d8dedb] rounded-md" />
          <div className="w-[19px] h-[22px] origin-top-left rotate-90 bg-[#d8dedb] rounded-md" />
          <div className="w-[19px] h-14 origin-top-left rotate-90 bg-[#d8dedb] rounded-md" />
        </div>
      </div>
    </div>
  );
};

const SessionCards: React.FC<SessionCardsProps> = ({
  onSessionSelect,
  user_id,
  selectedGroupID,
  selectedClassID,
  selectedClassName
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);

  const groupID = selectedGroupID ?? "";

  const { data, error, isLoading } = api.session.getSessionsByGroupId.useQuery(
    { group_id: groupID },
    {
      enabled: !!selectedGroupID,
    }
  );

  console.log(data);

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
          href={`/classes/${selectedClassID}/groups/${groupID}/sessions/${session.id}?user=${user_id}&className=${selectedClassName}&classID=${selectedClassID}&groupID=${selectedGroupID}&sessionID=${session.id}`}
          key={session.id}
        >
          <SessionCard
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
