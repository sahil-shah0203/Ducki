"use client";
import { useUser } from "@clerk/nextjs";
import MainPage from "~/app/page";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";


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
        { enabled: !!user_id } // Ensures query only runs if user_id exists
      )
    : { data: undefined, error: undefined, isLoading: false };

  // list of sessions for the user sorted by due date
  const sortedSessions = sessions?.slice().sort((a, b) => {
    const dateA = new Date(a.due).getTime();
    const dateB = new Date(b.due).getTime();
    return dateA - dateB;
  });

  return (
    <div className="flex flex-row w-full h-screen">
      <MainPage/>
      <div className="w-full max-w-8xl p-4 z-10">
        <h1>Welcome to Ducki</h1>
        <div className="h-[431px] p-5 bg-[#f3f5f4] rounded-[20px] flex-col justify-end items-start gap-10 inline-flex mr-4">
          <div className="h-[94px] py-2.5 flex-col justify-start items-start gap-[5px] flex">
            <div className="self-stretch text-[#3a5e4d] text-[32px] font-semibold font-['DM Sans']">Coming up today</div>
            <div className="self-stretch text-black/50 text-2xl font-medium font-['DM Sans'] leading-[27px]">A quick look at today’s sessions</div>
          </div>
          <div className="justify-start items-center gap-5 inline-flex">
            <div className="p-5 bg-white rounded-[20px] flex-col justify-end items-center gap-[18px] inline-flex">
              <div className="self-stretch h-[58px] flex-col justify-start items-start flex">
                <div className="justify-start items-center gap-[5px] inline-flex">
                  <div className="w-[5px] h-[5px] bg-[#bfb5d7] rounded-full" />
                  <div className="text-[#bfb5d7] text-xs font-bold font-['DM Sans']">US History</div>
                </div>
                <div className="w-[200px] text-[#000d02] text-[32px] font-medium font-['DM Sans']">Session #3</div>
              </div>
              <div className="self-stretch h-[82px] flex-col justify-center items-start gap-2.5 flex">
                <div className="self-stretch text-black/30 text-sm font-medium font-['DM Sans']">Colonial America</div>
                <div className="self-stretch text-black/30 text-sm font-medium font-['DM Sans']">American Revolution</div>
                <div className="text-black/50 text-xs font-bold font-['DM Sans']">and 3 more</div>
              </div>
              <div className="self-stretch px-[30px] py-2.5 bg-[#669880] rounded-[30px] justify-center items-center gap-2.5 inline-flex">
                <div className="text-white text-lg font-medium font-['DM Sans'] leading-tight">Start session</div>
              </div>
            </div>
            <div className="p-5 bg-white rounded-[20px] flex-col justify-end items-center gap-[18px] inline-flex">
              <div className="self-stretch h-[58px] flex-col justify-start items-start flex">
                <div className="justify-start items-center gap-[5px] inline-flex">
                  <div className="w-[5px] h-[5px] bg-[#f4938a] rounded-full" />
                  <div className="text-[#f4938a] text-xs font-bold font-['DM Sans']">Biology</div>
                </div>
                <div className="w-[200px] text-[#000d02] text-[32px] font-medium font-['DM Sans']">Session #2</div>
              </div>
              <div className="self-stretch h-[82px] flex-col justify-center items-start gap-2.5 flex">
                <div className="self-stretch text-black/30 text-sm font-medium font-['DM Sans']">Cell Structure and Function</div>
                <div className="self-stretch text-black/30 text-sm font-medium font-['DM Sans']">DNA Replication</div>
                <div className="text-black/50 text-xs font-bold font-['DM Sans']">and 2 more</div>
              </div>
              <div className="self-stretch px-[30px] py-2.5 bg-[#669880] rounded-[30px] justify-center items-center gap-2.5 inline-flex">
                <div className="text-white text-lg font-medium font-['DM Sans'] leading-tight">Start session</div>
              </div>
            </div>
            <div className="p-5 bg-white rounded-[20px] flex-col justify-end items-center gap-[18px] inline-flex">
              <div className="self-stretch h-[58px] flex-col justify-start items-start flex">
                <div className="justify-start items-center gap-[5px] inline-flex">
                  <div className="w-[5px] h-[5px] bg-[#bacbde] rounded-full" />
                  <div className="text-[#bacbde] text-xs font-bold font-['DM Sans']">Anatomy</div>
                </div>
                <div className="w-[200px] text-[#000d02] text-[32px] font-medium font-['DM Sans']">Session #3</div>
              </div>
              <div className="self-stretch h-[82px] flex-col justify-center items-start gap-2.5 flex">
                <div className="self-stretch text-black/30 text-sm font-medium font-['DM Sans']">Body Organization</div>
                <div className="self-stretch text-black/30 text-sm font-medium font-['DM Sans']">Muscular System</div>
                <div className="text-black/50 text-xs font-bold font-['DM Sans']">and 1 more</div>
              </div>
              <div className="self-stretch px-[30px] py-2.5 bg-[#669880] rounded-[30px] justify-center items-center gap-2.5 inline-flex">
                <div className="text-white text-lg font-medium font-['DM Sans'] leading-tight">Start session</div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-[275px] h-[1025px] p-5 bg-[#f3f5f4] rounded-[20px] flex-col justify-end items-start gap-10 inline-flex ml-4">
          <div className="self-stretch h-[94px] py-2.5 flex-col justify-start items-start gap-[5px] flex">
            <div className="self-stretch text-[#3a5e4d] text-[32px] font-semibold font-['DM Sans']">Upcoming</div>
            <div className="text-black/50 text-2xl font-medium font-['DM Sans'] leading-[27px]">A quick look ahead</div>
          </div>
          <div className="self-stretch h-[257px] px-2.5 flex-col justify-start items-center gap-2.5 flex">
            <div className="self-stretch text-[#31493e] text-lg font-bold font-['DM Sans'] leading-tight">Monday, October 21 </div>
            <div className="self-stretch py-2.5 bg-[#f3f5f4] rounded-[5px] justify-start items-center gap-[29px] inline-flex">
              <div className="grow shrink basis-0 flex-col justify-start items-start gap-[5px] inline-flex">
                <div className="justify-start items-center gap-[5px] inline-flex">
                  <div className="w-[5px] h-[5px] bg-[#84988e] rounded-full" />
                  <div className="text-[#84988e] text-xs font-bold font-['DM Sans']">US History</div>
                </div>
                <div className="w-[225px] text-black/20 text-lg font-bold font-['DM Sans'] leading-tight">Session #5</div>
              </div>
            </div>
            <div className="self-stretch py-2.5 bg-[#f3f5f4] rounded-[5px] justify-start items-center gap-[29px] inline-flex">
              <div className="grow shrink basis-0 flex-col justify-start items-start gap-[5px] inline-flex">
                <div className="justify-start items-center gap-[5px] inline-flex">
                  <div className="w-[5px] h-[5px] bg-[#84988e] rounded-full" />
                  <div className="text-[#84988e] text-xs font-bold font-['DM Sans']">Biology</div>
                </div>
                <div className="w-[225px] text-black/20 text-lg font-bold font-['DM Sans'] leading-tight">Session #4</div>
              </div>
            </div>
            <div className="self-stretch py-2.5 bg-[#f3f5f4] rounded-[5px] justify-start items-center gap-[29px] inline-flex">
              <div className="grow shrink basis-0 flex-col justify-start items-start gap-[5px] inline-flex">
                <div className="justify-start items-center gap-[5px] inline-flex">
                  <div className="w-[5px] h-[5px] bg-[#84988e] rounded-full" />
                  <div className="text-[#84988e] text-xs font-bold font-['DM Sans']">Anatomy</div>
                </div>
                <div className="w-[225px] text-black/20 text-lg font-bold font-['DM Sans'] leading-tight">Session #3</div>
              </div>
            </div>
          </div>
          <div className="self-stretch h-[257px] px-2.5 flex-col justify-start items-center gap-2.5 flex">
            <div className="self-stretch text-[#31493e] text-lg font-bold font-['DM Sans'] leading-tight">Tuesday, October 22 </div>
            <div className="self-stretch py-2.5 bg-[#f3f5f4] rounded-[5px] justify-start items-center gap-[29px] inline-flex">
              <div className="grow shrink basis-0 flex-col justify-start items-start gap-[5px] inline-flex">
                <div className="justify-start items-center gap-[5px] inline-flex">
                  <div className="w-[5px] h-[5px] bg-[#84988e] rounded-full" />
                  <div className="text-[#84988e] text-xs font-bold font-['DM Sans']">US History</div>
                </div>
                <div className="w-[225px] text-black/20 text-lg font-bold font-['DM Sans'] leading-tight">Session #5</div>
              </div>
            </div>
            <div className="self-stretch py-2.5 bg-[#f3f5f4] rounded-[5px] justify-start items-center gap-[29px] inline-flex">
              <div className="grow shrink basis-0 flex-col justify-start items-start gap-[5px] inline-flex">
                <div className="justify-start items-center gap-[5px] inline-flex">
                  <div className="w-[5px] h-[5px] bg-[#84988e] rounded-full" />
                  <div className="text-[#84988e] text-xs font-bold font-['DM Sans']">Biology</div>
                </div>
                <div className="w-[225px] text-black/20 text-lg font-bold font-['DM Sans'] leading-tight">Session #4</div>
              </div>
            </div>
            <div className="self-stretch py-2.5 bg-[#f3f5f4] rounded-[5px] justify-start items-center gap-[29px] inline-flex">
              <div className="grow shrink basis-0 flex-col justify-start items-start gap-[5px] inline-flex">
                <div className="justify-start items-center gap-[5px] inline-flex">
                  <div className="w-[5px] h-[5px] bg-[#84988e] rounded-full" />
                  <div className="text-[#84988e] text-xs font-bold font-['DM Sans']">Anatomy</div>
                </div>
                <div className="w-[225px] text-black/20 text-lg font-bold font-['DM Sans'] leading-tight">Session #3</div>
              </div>
            </div>
          </div>
          <div className="self-stretch h-[257px] px-2.5 flex-col justify-start items-center gap-2.5 flex">
            <div className="self-stretch text-[#31493e] text-lg font-bold font-['DM Sans'] leading-tight">Wednesday, October 23</div>
            <div className="self-stretch py-2.5 bg-[#f3f5f4] rounded-[5px] justify-start items-center gap-[29px] inline-flex">
              <div className="grow shrink basis-0 flex-col justify-start items-start gap-[5px] inline-flex">
                <div className="justify-start items-center gap-[5px] inline-flex">
                  <div className="w-[5px] h-[5px] bg-[#84988e] rounded-full" />
                  <div className="text-[#84988e] text-xs font-bold font-['DM Sans']">US History</div>
                </div>
                <div className="w-[225px] text-black/20 text-lg font-bold font-['DM Sans'] leading-tight">Session #5</div>
              </div>
            </div>
            <div className="self-stretch py-2.5 bg-[#f3f5f4] rounded-[5px] justify-start items-center gap-[29px] inline-flex">
              <div className="grow shrink basis-0 flex-col justify-start items-start gap-[5px] inline-flex">
                <div className="justify-start items-center gap-[5px] inline-flex">
                  <div className="w-[5px] h-[5px] bg-[#84988e] rounded-full" />
                  <div className="text-[#84988e] text-xs font-bold font-['DM Sans']">Biology</div>
                </div>
                <div className="w-[225px] text-black/20 text-lg font-bold font-['DM Sans'] leading-tight">Session #4</div>
              </div>
            </div>
            <div className="self-stretch py-2.5 bg-[#f3f5f4] rounded-[5px] justify-start items-center gap-[29px] inline-flex">
              <div className="grow shrink basis-0 flex-col justify-start items-start gap-[5px] inline-flex">
                <div className="justify-start items-center gap-[5px] inline-flex">
                  <div className="w-[5px] h-[5px] bg-[#84988e] rounded-full" />
                  <div className="text-[#84988e] text-xs font-bold font-['DM Sans']">Anatomy</div>
                </div>
                <div className="w-[225px] text-black/20 text-lg font-bold font-['DM Sans'] leading-tight">Session #3</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
