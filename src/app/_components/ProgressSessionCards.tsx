import React from "react";
import Link from "next/link";

interface SessionData {
  id: string; // Unique identifier for the session
  title: string; // Title of the session
  class_name: string; // Class name associated with the session
  date: string; // Start date of the session
  due: string; // Due date for the session
  group_id: string; // Group ID associated with the session
  class_id: number; // Class ID associated with the session
  user_id: number; // User ID associated with the session
}

interface ProgressSessionCardProps extends SessionData {}

interface ProgressSessionCardsProps {
  sessions: SessionData[]; // Array of session objects
}

const ProgressSessionCard: React.FC<ProgressSessionCardProps> = ({
  id,
  title,
  class_name,
  date,
  due,
  group_id,
  class_id,
  user_id
}) => {
  return (
    <div className="w-[230px] h-[280px] p-5 bg-white rounded-[20px] flex flex-col justify-between items-start gap-4 shadow-md">
      {/* Header */}
      <div className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-2">
          <div className="w-[5px] h-[5px] bg-[#bfb5d7] rounded-full"></div>
          <div className="text-[#bfb5d7] text-xs font-bold font-['DM Sans']">
            {class_name}
          </div>
        </div>
        <div className="text-[#000d02] text-[32px] font-medium font-['DM Sans']">
          {title}
        </div>
      </div>

      {/* Progress or Additional Info */}
      <div className="w-full flex flex-col items-start gap-2">
        <div className="text-black/30 text-sm font-medium font-['DM Sans']">
          Due: {due}
        </div>
        <div className="text-black/30 text-sm font-medium font-['DM Sans']">
          Date: {date}
        </div>
      </div>

      {/* Action Button */}
      <Link
        href={`/classes/${class_id}/groups/${group_id}/sessions/${id}?user=${user_id}&className=${class_name}&classID=${class_id}&groupID=${group_id}&sessionID=${id}`}
        key={id}
      >
        <div className="self-stretch px-[30px] py-2.5 bg-[#669880] rounded-[30px] flex justify-center items-center cursor-pointer">
          <div className="text-white text-lg font-medium font-['DM Sans']">
            Start Session
          </div>
        </div>
      </Link>
    </div>
  );
};

const ProgressSessionCards: React.FC<ProgressSessionCardsProps> = ({
  sessions,
}) => {
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 p-4">
      {sessions.map((session) => (
        <ProgressSessionCard
          key={session.id}
          id={session.id}
          title={session.title}
          class_name={session.class_name}
          date={session.date}
          due={session.due}
          group_id={session.group_id}
          class_id={session.class_id}
          user_id={session.user_id}
        />
      ))}
    </div>
  );
};

export default ProgressSessionCards;
