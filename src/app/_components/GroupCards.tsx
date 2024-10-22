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
    <div className="w-[367.67px] h-[351.62px] relative shadow">
      <div className="w-[367.67px] h-[257px] px-5 py-6 left-0 top-[-2px] absolute bg-[#f9faf9] rounded-tl-sm rounded-tr-sm border-[#e5eae8] flex-col justify-center items-center gap-1 inline-flex">
        <div className="self-stretch p-3 rounded-sm justify-start items-center gap-5 inline-flex">
          <div className="w-10 h-10 relative">
            <div className="w-10 h-10 left-0 top-0 absolute bg-[#e5eae8] rounded-[3.13px]" />
            <div className="w-[24.42px] h-[18.88px] left-[8px] top-[10.50px] absolute">
              <div className="w-[24.42px] h-[3.50px] left-0 top-0 absolute bg-[#bcc7c1] rounded-sm" />
              <div className="w-[24.42px] h-[3.50px] left-0 top-[7.69px] absolute bg-[#bcc7c1] rounded-sm" />
              <div className="w-[24.42px] h-[3.50px] left-0 top-[15.38px] absolute bg-[#bcc7c1] rounded-sm" />
            </div>
          </div>
          <div className="grow shrink basis-0 opacity-75 flex-col justify-start items-start gap-0.5 inline-flex">
            <div className="self-stretch text-[#84988e] text-lg font-medium font-['DM Sans'] leading-tight">Session #1</div>
            <div className="self-stretch text-black/30 text-xs font-medium font-['DM Sans']">{dateCreated}</div>
          </div>
        </div>
        <div className="self-stretch p-3 rounded-sm justify-start items-center gap-5 inline-flex">
          <div className="w-10 h-10 relative">
            <div className="w-10 h-10 left-0 top-0 absolute bg-[#e5eae8] rounded-[3.13px]" />
            <div className="w-[24.42px] h-[18.88px] left-[8px] top-[10.50px] absolute">
              <div className="w-[24.42px] h-[3.50px] left-0 top-0 absolute bg-[#bcc7c1] rounded-sm" />
              <div className="w-[24.42px] h-[3.50px] left-0 top-[7.69px] absolute bg-[#bcc7c1] rounded-sm" />
              <div className="w-[24.42px] h-[3.50px] left-0 top-[15.38px] absolute bg-[#bcc7c1] rounded-sm" />
            </div>
          </div>
          <div className="grow shrink basis-0 opacity-75 flex-col justify-start items-start gap-0.5 inline-flex">
            <div className="self-stretch text-[#84988e] text-lg font-medium font-['DM Sans'] leading-tight">Session #2</div>
            <div className="self-stretch text-black/30 text-xs font-medium font-['DM Sans']">{dateCreated}</div>
          </div>
        </div>
        <div className="w-[301px] h-0.5 bg-[#e5eae8]" />
        <div className="self-stretch p-3 rounded-sm justify-start items-center gap-5 inline-flex">
          <div className="w-10 h-10 relative">
            <div className="w-10 h-10 left-0 top-0 absolute bg-[#e5eae8] rounded-[3.13px]" />
            <div className="w-[24.42px] h-[18.88px] left-[8px] top-[10.50px] absolute">
              <div className="w-[24.42px] h-[3.50px] left-0 top-0 absolute bg-[#bcc7c1] rounded-sm" />
              <div className="w-[24.42px] h-[3.50px] left-0 top-[7.69px] absolute bg-[#bcc7c1] rounded-sm" />
              <div className="w-[24.42px] h-[3.50px] left-0 top-[15.38px] absolute bg-[#bcc7c1] rounded-sm" />
            </div>
          </div>
          <div className="grow shrink basis-0 opacity-75 flex-col justify-start items-start gap-0.5 inline-flex">
            <div className="self-stretch text-[#84988e] text-lg font-medium font-['DM Sans'] leading-tight">Session #3</div>
            <div className="self-stretch text-black/30 text-xs font-medium font-['DM Sans']">{dateCreated}</div>
          </div>
        </div>
      </div>
      <div className="h-[100.21px] px-4 py-5 left-0 top-[255.41px] absolute bg-white border-t-2 border-[#e5eae8] flex-col justify-start items-start gap-[9px] inline-flex">
        <div className="self-stretch h-[25.60px] text-black text-[22.76px] font-medium font-['DM Sans'] leading-relaxed">{name}</div>
        <div className="self-stretch h-[25.60px] text-black/50 text-[15.17px] font-medium font-['DM Sans']">Last opened {dateCreated}</div>
      </div>
      <div className="px-[6.61px] py-[2.64px] left-[291px] top-[9.46px] absolute opacity-0 bg-[#e5ab00]/0 rounded-sm justify-center items-center gap-[6.61px] inline-flex" />
      <div className="w-[29.37px] h-6 pr-[4.37px] left-[280.74px] top-[12px] absolute opacity-0 bg-[#4f715f]/0 rounded-sm justify-start items-center inline-flex">
        <div className="h-[24.34px] px-0.5 py-2.5 rounded-sm justify-center items-center gap-[3px] inline-flex">
          <div className="w-[4.34px] h-[4.34px] bg-[#4f715f] rounded-full" />
          <div className="w-[4.34px] h-[4.34px] bg-[#4f715f] rounded-full" />
          <div className="w-[4.34px] h-[4.34px] bg-[#4f715f] rounded-full" />
        </div>
      </div>
      <div className="w-[301px] h-0.5 left-[33.01px] top-[90px] absolute bg-[#e5eae8]" />
    </div>
  );
};

const GroupCards: React.FC<GroupCardsProps> = ({
  class_id,
  user,
  selectedClassName,
}) => {
  const [groups, setGroups] = useState<Group[]>([]);

  // Only fetch data when class_id is defined
  const { data, error, isLoading } = class_id
    ? api.group.getGroupsByClassId.useQuery(
        { class_id }, // Ensure class_id is a number at this point
        {
          enabled: !!class_id,
        }
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
    <div className="grid grid-cols-1 overflow-auto md:grid-cols-2 lg:grid-cols-4">
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
