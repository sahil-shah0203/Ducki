"use client";
import { useUser } from "@clerk/nextjs";
import MainPage from "~/app/page";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import ProgressSessionCards from "~/app/_components/ProgressSessionCards";

interface Session {
  id: string;
  due: string;
  class_name: string;
  title: string;
  group_id?: string; // Optional in case these are undefined
  class_id?: number; // Optional in case these are undefined
}

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user_id = searchParams.get("user");

  if (!user) {
    router.push("/");
    return null; // Avoid rendering while redirecting
  }

  const { data: sessions } = user_id
    ? api.group.getSessionsByUserId.useQuery(
        { user_id: Number(user_id) },
        { enabled: !!user_id }
      )
    : { data: undefined };

  const sortedSessions = sessions?.slice().sort((a, b) => {
    const dateA = new Date(a.due).getTime();
    const dateB = new Date(b.due).getTime();
    return dateA - dateB;
  });

  const today = new Date().toISOString().split("T")[0];
  const todaySessions = sortedSessions?.filter((session) => {
    const sessionDate = new Date(session.due).toISOString().split("T")[0];
    return sessionDate === today;
  }) ?? [];

  return (
    <div className="flex flex-row w-full h-screen">
      <MainPage />
      <div className="w-full max-w-8xl p-4 z-10">
        <h1>Welcome to Ducki</h1>
        <div className="flex flex-row gap-10">
          {/* Coming up today Section */}
          <div className="flex-[3] p-5 bg-[#f3f5f4] rounded-[20px] flex flex-col gap-10">
            <div className="flex flex-col gap-2">
              <div className="text-[#3a5e4d] text-[32px] font-semibold font-['DM Sans']">
                Coming up today
              </div>
              <div className="text-black/50 text-2xl font-medium font-['DM Sans'] leading-[27px]">
                A quick look at today’s sessions
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todaySessions.length > 0 ? (
                <ProgressSessionCards
                  sessions={todaySessions.map((session) => ({
                    id: session.id,
                    title: session.title,
                    class_name: session.class_name,
                    date: session.due,
                    due: session.due,
                    group_id: session.group_id ?? "", // Fallback in case undefined
                    class_id: session.class_id ?? 0, // Fallback in case undefined
                    user_id: user_id ? Number(user_id) : 0,
                  }))}
                />
              ) : (
                <div className="text-black/50 text-lg font-medium font-['DM Sans']">
                  No sessions for today.
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Section */}
          <div className="flex-1 p-5 bg-[#f3f5f4] rounded-[20px] flex flex-col gap-10 overflow-y-auto">
            <div className="flex flex-col gap-2">
              <div className="text-[#3a5e4d] text-[32px] font-semibold font-['DM Sans']">
                Upcoming
              </div>
              <div className="text-black/50 text-2xl font-medium font-['DM Sans'] leading-[27px]">
                A quick look ahead
              </div>
            </div>
            {sortedSessions ? (
              Object.entries(
                sortedSessions.reduce((acc: Record<string, Session[]>, session: Session) => {
                  const sessionDate = session.due;
                  if (sessionDate) {
                    if (!acc[sessionDate]) {
                      acc[sessionDate] = []; // Initialize the array if it doesn't exist
                    }
                    acc[sessionDate]!.push(session); // Safe to push now with non-null assertion
                  }
                  return acc;
                }, {})                
              ).map(([date, sessions]) => (
                <div key={date} className="flex flex-col gap-4">
                  <div className="text-[#31493e] text-lg font-bold font-['DM Sans'] leading-tight">
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
              ))
            ) : (
              <div className="text-black/50 text-lg font-medium font-['DM Sans']">
                No upcoming sessions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
