import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const sessionRouter = createTRPCRouter({
  getSessionsByClassId: publicProcedure
    .input(z.object({ class_id: z.number() }))
    .query(async ({ ctx, input }) => {
      const sessions = await db.session.findMany({
        where: {
          class_id: input.class_id,
        },
        include: {
          class: true,
        },
      });
      return sessions.map((session: { session_id: number; class: { class_name: string }; createdAt: Date }) => ({
        id: session.session_id.toString(),
        title: session.class.class_name,
        date: session.createdAt.toISOString(),
      }));
    }),
  addSession: publicProcedure
    .input(z.object({
      user_id: z.number(),
      class_id: z.number(),
    }))
    .mutation(async ({ input }) => {
      const newSession = await db.session.create({
        data: {
          user_id: input.user_id,
          class_id: input.class_id,
          createdAt: new Date(),
        },
      });
      return { session_id: newSession.session_id, class_id: newSession.class_id, createdAt: newSession.createdAt };
    }),
});
