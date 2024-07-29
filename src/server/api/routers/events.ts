import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const eventsRouter = createTRPCRouter({
  getEventsByUserId: publicProcedure
    .input(z.object({ user_id: z.number() }))
    .query(async ({ ctx, input }) => {
      const events = await db.event.findMany({
        where: {
          user_id: input.user_id,
        },
      });
      return events;
    }),

  addEvent: publicProcedure
    .input(z.object({
      user_id: z.number(),
      title: z.string().min(1),
      description: z.string().optional(),
      start: z.string(),
      end: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const newEvent = await db.event.create({
        data: {
          user_id: input.user_id,
          title: input.title,
          description: input.description,
          start: new Date(input.start),
          end: new Date(input.end),
        },
      });
      return { event_id: newEvent.event_id, title: newEvent.title, start: newEvent.start, end: newEvent.end };
    }),

  removeEvent: publicProcedure
    .input(z.object({
      user_id: z.number(),
      event_id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const eventToDelete = await db.event.findFirst({
        where: {
          user_id: input.user_id,
          event_id: input.event_id,
        },
      });

      if (!eventToDelete) {
        throw new Error("Event not found or not owned by user");
      }

      await db.event.delete({
        where: {
          event_id: input.event_id,
        },
      });

      return { success: true };
    }),
});
