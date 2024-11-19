"use client";
import { useUser } from "@clerk/nextjs";
import MainPage from "~/app/page";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";

interface Session {
  id: string;
  due: string;
  class_name: string;
  title: string;
}

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user_id = searchParams.get("user");

  if (!user) {
    router.push("/");
  }

  const { data: sessions, error, isLoading } = user_id
    ? api.group.getSessionsByUserId.useQuery(
        { user_id: Number(user_id) },
        { enabled: !!user_id }
      )
    : { data: undefined, error: undefined, isLoading: false };

  const sortedSessions = sessions?.slice().sort((a, b) => {
    const dateA = new Date(a.due).getTime();
    const dateB = new Date(b.due).getTime();
    return dateA - dateB;
  });

  const today = new Date().toISOString().split("T")[0]; // Today's date in YYYY-MM-DD format
  const todaySessions = sortedSessions?.filter((session) => session.due === today) || [];

  return (
    <div className="flex flex-row w-full h-screen">
      <MainPage />
      <div className="w-full max-w-8xl p-4 z-10">
        <h1>Welcome to Ducki</h1>
        {/* Coming up today */}
        <div className="h-[431px] p-5 bg-[#f3f5f4] rounded-[20px] flex-col justify-start items-start gap-10 inline-flex mr-4">
          <div className="h-[94px] py-2.5 flex-col justify-start items-start gap-[5px] flex">
            <div className="self-stretch text-[#3a5e4d] text-[32px] font-semibold font-['DM Sans']">
              Coming up today
            </div>
            <div className="self-stretch text-black/50 text-2xl font-medium font-['DM Sans'] leading-[27px]">
              A quick look at today’s sessions
            </div>
          </div>
          <div className="justify-start items-center gap-5 inline-flex">
            {todaySessions.length > 0 ? (
              todaySessions.map((session) => (
                <div
                  key={session.id}
                  className="self-stretch py-1 bg-[#f3f5f4] rounded-[5px] justify-start items-center gap-2 inline-flex"
                >
                  <div className="grow shrink basis-0 flex-col justify-start items-start gap-1 inline-flex">
                    <div className="justify-start items-center gap-2 inline-flex">
                      <div className="w-[5px] h-[5px] bg-[#84988e] rounded-full" />
                      <div className="text-[#84988e] text-xs font-bold font-['DM Sans']">
                        {session.class_name}
                      </div>
                    </div>
                    <div className="w-[225px] text-black/20 text-lg font-bold font-['DM Sans'] leading-tight">
                      {session.title}
                    </div>
                  </div>
                  <div className="self-stretch h-[82px] flex-col justify-center items-start gap-2.5 flex">
                    <div className="self-stretch text-black/30 text-sm font-medium font-['DM Sans']">
                      Session details...
                    </div>
                    <div className="text-black/50 text-xs font-bold font-['DM Sans']">
                      More information...
                    </div>
                  </div>
                  <div className="self-stretch px-[30px] py-2.5 bg-[#669880] rounded-[30px] justify-center items-center gap-2.5 inline-flex">
                    <div className="text-white text-lg font-medium font-['DM Sans'] leading-tight">
                      Start session
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-black/50 text-lg font-medium font-['DM Sans']">
                No sessions for today.
              </div>
            )}
          </div>
        </div>
        {/* Upcoming Section */}
        <div className="w-[275px] h-[1025px] p-5 bg-[#f3f5f4] rounded-[20px] flex-col justify-end items-start gap-10 inline-flex ml-4">
          <div className="self-stretch h-[94px] py-2.5 flex-col justify-start items-start gap-[5px] flex">
            <div className="self-stretch text-[#3a5e4d] text-[32px] font-semibold font-['DM Sans']">Upcoming</div>
            <div className="text-black/50 text-2xl font-medium font-['DM Sans'] leading-[27px]">
              A quick look ahead
            </div>
          </div>
          {sortedSessions?.reduce((acc: Record<string, Session[]>, session: Session) => {
            const sessionDate = session.due;
            if (!acc[sessionDate]) acc[sessionDate] = [];
            acc[sessionDate].push(session);
            return acc;
          }, {}) &&
            Object.entries(
              sortedSessions.reduce((acc: Record<string, Session[]>, session: Session) => {
                const sessionDate = session.due;
                if (!acc[sessionDate]) acc[sessionDate] = [];
                acc[sessionDate].push(session);
                return acc;
              }, {})
            ).map(([date, sessions]) => (
              <div
                key={date}
                className="self-stretch h-[257px] px-2.5 flex-col justify-start items-center gap-2.5 flex"
              >
                <div className="self-stretch text-[#31493e] text-lg font-bold font-['DM Sans'] leading-tight">
                  {date}
                </div>
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="self-stretch py-2.5 bg-[#f3f5f4] rounded-[5px] justify-start items-center gap-[29px] inline-flex"
                  >
                    <div className="grow shrink basis-0 flex-col justify-start items-start gap-[5px] inline-flex">
                      <div className="justify-start items-center gap-[5px] inline-flex">
                        <div className="w-[5px] h-[5px] bg-[#84988e] rounded-full" />
                        <div className="text-[#84988e] text-xs font-bold font-['DM Sans']">
                          {session.class_name}
                        </div>
                      </div>
                      <div className="w-[225px] text-black/20 text-lg font-bold font-['DM Sans'] leading-tight">
                        {session.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
