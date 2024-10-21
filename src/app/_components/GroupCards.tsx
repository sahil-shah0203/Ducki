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
    <div
      className="relative mt-10 cursor-pointer rounded-lg bg-[#eeeeee] p-4 shadow-md transition-shadow duration-200 hover:shadow-lg"
      style={{ width: "230px", height: "280px" }}
    >
      <div
        className="mx-auto rounded-lg bg-white"
        style={{ padding: "10px" }}
      >
        <p className="text-sm">Group: {name}</p>
        <p className="text-gray-400 text-xs">Created on: {dateCreated}</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0">
        <div
          className="flex items-center justify-between rounded-b-lg rounded-t-none border border-gray-300 bg-white p-2"
          style={{ borderTopLeftRadius: "0", borderTopRightRadius: "0" }}
        >
          <div>
            <div className="text-lg font-semibold">{name}</div>
            <div className="text-gray-600">{dateCreated}</div>
          </div>
          <div className="text-gray-400"></div>
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

  // Fetch groups by class ID
  const { data, error, isLoading } = api.group.getGroupsByClassId.useQuery(
    { class_id: class_id ?? 0 },
    {
      enabled: !!class_id,
    }
  );

  useEffect(() => {
    if (data) {
      setGroups(data);
    } else if (error) {
      console.error("Error fetching groups:", error);
    }
  }, [data, error]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading groups: {error.message}</div>;

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