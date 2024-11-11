import React from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

interface SessionCardProps {
  sessionId: string;
  title: string;
  date: string;
  onClick: (sessionId: string) => void;
  understandingLevels: number[];
}

interface SessionCardsProps {
  onSessionSelect: (sessionId: string) => void;
  user_id: number | undefined;
  selectedGroupID: string | null;
  selectedClassName: string | null;
  selectedClassID: string | null;
}

// SessionCard Component
const SessionCard: React.FC<SessionCardProps> = ({
  sessionId,
  title,
  date,
  onClick,
  understandingLevels,
}) => {
  const handleClick = () => {
    onClick(sessionId);
  };

  // Calculate the ratios for the colored bar
  const total = understandingLevels.length;
  const redCount = understandingLevels.filter((level) => level >= 1 && level <= 2).length;
  const yellowCount = understandingLevels.filter((level) => level >= 3 && level <= 4).length;
  const greenCount = understandingLevels.filter((level) => level === 5).length;

  const redRatio = (redCount / total) * 100 || 0;
  const yellowRatio = (yellowCount / total) * 100 || 0;
  const greenRatio = (greenCount / total) * 100 || 0;

  return (
    <div className="w-[325px] h-[235px] relative hover:shadow-xl transition-shadow duration-200" onClick={handleClick}>
      <div className="w-[325px] h-[150px] left-0 top-0 absolute">
        <div className="w-[325px] h-[150px] left-0 top-0 absolute bg-white rounded"></div>
        <div className="w-[324.93px] h-[89.14px] left-0 top-[117px] absolute">
          <div className="w-[324.93px] h-[89.14px] left-0 top-0 absolute bg-white rounded-bl rounded-br"></div>
          <div className="w-[293.90px] h-[50.70px] left-[16px] top-[23px] absolute flex-col justify-start items-start gap-1 inline-flex">
            <div className="self-stretch justify-start items-center gap-1 inline-flex">
              <div className="w-[261px] h-[26px] text-[#669880] text-2xl font-medium font-['DM Sans'] leading-[27px]">
                {title}
              </div>
            </div>
            <div className="self-stretch h-[25.60px] text-[#84988e] text-base font-medium font-['DM Sans']">
              {date}
            </div>
          </div>
        </div>
        <div className="w-[307px] h-[110px] left-[9px] top-[120.86px] absolute opacity-0 bg-[#f3f5f4] rounded-[10px]"></div>
        <div className="w-[273px] h-[49px] left-[26px] top-[32.86px] absolute justify-start items-center gap-1 inline-flex">
          {/* Colored bar */}
          <div className="flex w-full h-full rounded-sm overflow-hidden">
            <div style={{ width: `${redRatio}%` }} className="bg-[#ee5a36]"></div>
            <div style={{ width: `${yellowRatio}%` }} className="bg-[#f5ab54]"></div>
            <div style={{ width: `${greenRatio}%` }} className="bg-[#1a9461]"></div>
          </div>
        </div>
        <div className="w-[307px] h-0.5 left-[9px] top-[127.28px] absolute bg-[#f3f5f4] rounded-[20px]"></div>
      </div>
      <div className="h-[45.43px] p-1.5 left-[239.86px] top-[5px] absolute bg-[#e5ab00]/0 rounded justify-end items-center gap-[9.29px] inline-flex">
        <div className="w-[25px] h-6 bg-[#4f715f]/0 rounded-sm justify-center items-center flex">
          <div className="h-[24.34px] px-0.5 py-2.5 rounded-sm justify-center items-center gap-[3px] inline-flex">
            <div className="w-[4.34px] h-[4.34px] bg-[#4f715f] rounded-full"></div>
            <div className="w-[4.34px] h-[4.34px] bg-[#4f715f] rounded-full"></div>
            <div className="w-[4.34px] h-[4.34px] bg-[#4f715f] rounded-full"></div>
          </div>
        </div>
      </div>
      <div className="p-1 left-[197px] top-[90px] absolute bg-[#ee5a36]/10 rounded justify-center items-center gap-2.5 inline-flex">
        <div className="text-[#ee5a36] text-xs font-bold font-['DM Sans']">9 Struggling</div>
      </div>
    </div>
  );
};

// SessionCards Component
const SessionCards: React.FC<SessionCardsProps> = ({
  onSessionSelect,
  user_id,
  selectedGroupID,
  selectedClassID,
  selectedClassName,
}) => {
  const groupID = selectedGroupID ?? "";

  // Use the new `getSessionsWithConcepts` procedure
  const { data: sessions, error, isLoading } =
    api.session.getSessionsWithConcepts.useQuery(
      {
        group_id: groupID,
        class_id: Number(selectedClassID),
        user_id: Number(user_id),
      },
      { enabled: !!selectedGroupID }
    );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading sessions: {error.message}</div>;

  return (
    <div className="flex flex-wrap gap-4 justify-left overflow-x-auto">
      {sessions?.map((session) => (
        <Link
          href={`/classes/${selectedClassID}/groups/${groupID}/sessions/${session.id}?user=${user_id}&className=${selectedClassName}&classID=${selectedClassID}&groupID=${selectedGroupID}&sessionID=${session.id}`}
          key={session.id}
        >
          <SessionCard
            sessionId={session.id}
            title={session.title}
            date={session.date ?? ""}
            onClick={onSessionSelect}
            understandingLevels={session.understandingLevels || []}
          />
        </Link>
      ))}
    </div>
  );
};

export default SessionCards;
