import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import Link from "next/link";

interface Group {
  id: string;
  title: string;
  date: string;
}

interface GroupCardProps {
  groupId: string;
  name: string;
  dateCreated: string;
}

interface GroupCardsProps {
  class_id: number | undefined;
  user: number | undefined;
  selectedClassName: string | null;
}

const GroupCard: React.FC<GroupCardProps> = ({
  groupId,
  name,
  dateCreated,
}) => {
  return (
    <div className="w-[230px] h-[280px] relative mt-6 mx-4 cursor-pointer bg-[#e2e9e5] shadow-md hover:shadow-xl transition-shadow duration-200">
      <div className="w-full h-[200px] px-5 py-6 bg-[#f9faf9] border-b border-[#e5eae8] flex flex-col justify-center items-center">
        
        {/* Session #1 */}
        <div className="self-stretch p-3 flex justify-start items-center gap-5">
          <div className="w-10 h-10 relative">
            <div className="w-10 h-10 bg-[#e5eae8] absolute" />
            <div className="w-[24.42px] h-[18.88px] absolute left-[8px] top-[10.5px]">
              <div className="w-[24.42px] h-[3.5px] bg-[#bcc7c1] rounded-sm mb-1"></div>
              <div className="w-[24.42px] h-[3.5px] bg-[#bcc7c1] rounded-sm mb-1"></div>
              <div className="w-[24.42px] h-[3.5px] bg-[#bcc7c1] rounded-sm"></div>
            </div>
          </div>
          <div className="flex flex-col justify-start items-start">
            <div className="text-[#84988e] text-lg font-medium font-['DM Sans']">
              Session #1
            </div>
            <div className="text-black/30 text-xs font-medium font-['DM Sans']">
              {dateCreated}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#e5eae8]" />

        {/* Session #2 */}
        <div className="self-stretch p-3 flex justify-start items-center gap-5 border-t border-[#e5eae8]">
          <div className="w-10 h-10 relative">
            <div className="w-10 h-10 bg-[#e5eae8] absolute" />
            <div className="w-[24.42px] h-[18.88px] absolute left-[8px] top-[10.5px]">
              <div className="w-[24.42px] h-[3.5px] bg-[#bcc7c1] rounded-sm mb-1"></div>
              <div className="w-[24.42px] h-[3.5px] bg-[#bcc7c1] rounded-sm mb-1"></div>
              <div className="w-[24.42px] h-[3.5px] bg-[#bcc7c1] rounded-sm"></div>
            </div>
          </div>
          <div className="flex flex-col justify-start items-start">
            <div className="text-[#84988e] text-lg font-medium font-['DM Sans']">
              Session #2
            </div>
            <div className="text-black/30 text-xs font-medium font-['DM Sans']">
              {dateCreated}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#e5eae8]" />

        {/* Session #3 */}
        <div className="self-stretch p-3 flex justify-start items-center gap-5 border-t border-[#e5eae8]">
          <div className="w-10 h-10 relative">
            <div className="w-10 h-10 bg-[#e5eae8] absolute" />
            <div className="w-[24.42px] h-[18.88px] absolute left-[8px] top-[10.5px]">
              <div className="w-[24.42px] h-[3.5px] bg-[#bcc7c1] rounded-sm mb-1"></div>
              <div className="w-[24.42px] h-[3.5px] bg-[#bcc7c1] rounded-sm mb-1"></div>
              <div className="w-[24.42px] h-[3.5px] bg-[#bcc7c1] rounded-sm"></div>
            </div>
          </div>
          <div className="flex flex-col justify-start items-start">
            <div className="text-[#84988e] text-lg font-medium font-['DM Sans']">
              Session #3
            </div>
            <div className="text-black/30 text-xs font-medium font-['DM Sans']">
              {dateCreated}
            </div>
          </div>
        </div>
      </div>

      {/* Footer with title and last opened date */}
      <div className="p-4 bg-white border-t border-[#e5eae8]">
        <div className="text-black text-lg font-semibold font-['DM Sans']">
          {name}
        </div>
        <div className="text-gray-500 text-sm font-medium font-['DM Sans']">
          Last opened {dateCreated}
        </div>
      </div>
    </div>
  );
};

const GroupCards: React.FC<GroupCardsProps> = ({
  class_id,
  user,
  selectedClassName,
}) => {
  const [groups, setGroups] = useState<Group[]>([]);

  const { data, error, isLoading } = class_id
    ? api.group.getGroupsByClassId.useQuery(
        { class_id },
        { enabled: !!class_id }
      )
    : { data: undefined, error: undefined, isLoading: false };

  useEffect(() => {
    if (data) {
      setGroups(data);
    } else if (error) {
      console.error("Error fetching groups:", error);
    }
  }, [data, error]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading groups: {error?.message}</div>;

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 p-4">
      {groups.map((group: Group) => (
        <Link
          href={`/classes/${class_id}/groups/${group.id}?user=${user}&className=${selectedClassName}&classID=${class_id}&groupID=${group.id}`}
          key={group.id}
        >
          <GroupCard
            key={group.id}
            groupId={group.id}
            name={group.title}
            dateCreated={group.date}
          />
        </Link>
      ))}
    </div>
  );
};

export default GroupCards;
