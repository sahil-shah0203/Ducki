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

  const total = understandingLevels.length;
  const counts = {
    red: understandingLevels.filter((level) => level === 1).length, // Struggling
    yellow: understandingLevels.filter((level) => level === 2).length, // Comfortable
    orange: understandingLevels.filter((level) => level === 3).length, // Developing
    green: understandingLevels.filter((level) => level === 4).length, // Mastered
  };
  
  // Calculate percentages for the colored bar
  const redRatio = (counts.red / total) * 100 || 0;
  const yellowRatio = (counts.yellow / total) * 100 || 0;
  const orangeRatio = (counts.orange / total) * 100 || 0;
  const greenRatio = (counts.green / total) * 100 || 0;
  
  // Determine the category with the highest count
  const maxCategory = Object.entries(counts).reduce(
    (max, [key, count]) => (count > max.count ? { key, count } : max),
    { key: "red", count: 0 }
  );
  
  const categoryLabels: Record<string, string> = {
    red: "Struggling",
    yellow: "Comfortable",
    orange: "Developing",
    green: "Mastered",
  };
  
  // Get the corresponding label and count
  const highestCountLabel = categoryLabels[maxCategory.key];
  const highestCount = maxCategory.count;
  
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
          {/* Colored Bar */}
          <div className="flex w-full h-full rounded-sm overflow-hidden">
            <div style={{ width: `${redRatio}%` }} className="bg-[#ee5a36]"></div>
            <div style={{ width: `${yellowRatio}%` }} className="bg-[#f5ab54]"></div>
            <div style={{ width: `${orangeRatio}%` }} className="bg-[#ee7f4c]"></div>
            <div style={{ width: `${greenRatio}%` }} className="bg-[#1a9461]"></div>
          </div>
        </div>
        <div className="w-[307px] h-0.5 left-[9px] top-[127.28px] absolute bg-[#f3f5f4] rounded-[20px]"></div>
      </div>
      <div className="p-1 left-[112px] top-[90px] absolute rounded justify-center items-center gap-2.5 inline-flex">
        {/* Dynamic Highest Category Label */}
        <div
          className={`p-1 rounded inline-flex justify-center items-center gap-2.5`}
          style={{
            backgroundColor: `${
              maxCategory.key === "red"
                ? "#ee5a36"
                : maxCategory.key === "yellow"
                ? "#f5ab54"
                : maxCategory.key === "orange"
                ? "#ee7f4c"
                : "#1a9461"
            }20`, // Add opacity for the background color (e.g., #ee5a3620 is 12.5% opacity)
            color: `${
              maxCategory.key === "red"
                ? "#ee5a36"
                : maxCategory.key === "yellow"
                ? "#f5ab54"
                : maxCategory.key === "orange"
                ? "#ee7f4c"
                : "#1a9461"
            }`,
          }}
        >
          <span className="text-xs font-bold font-['DM Sans']">
            {highestCount} {highestCountLabel}
          </span>
        </div>
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
