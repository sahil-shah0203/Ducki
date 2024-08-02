import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const eventsRouter = createTRPCRouter({
  getEventsByUserId: publicProcedure
    .input(z.object({ user_id: z.number() }))
    .query(async ({ ctx, input }) => {
      const events = await ctx.db.event.findMany({
        where: {
          user_id: input.user_id,
        },
      });
      return events;
    }),

  addEvent: publicProcedure
    .input(z.object({
      event_id: z.number(),
      user_id: z.number(),
      title: z.string().min(1),
      description: z.string().optional(),
      place: z.string().optional(),
      start: z.string(),
      end: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const newEvent = await ctx.db.event.create({
        data: {
          event_id: input.event_id,
          user_id: input.user_id,
          title: input.title,
          description: input.description,
          place: input.place,
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
      const eventToDelete = await ctx.db.event.findFirst({
        where: {
          user_id: input.user_id,
          event_id: input.event_id,
        },
      });

      if (!eventToDelete) {
        throw new Error("Event not found or not owned by user");
      }

      await ctx.db.event.delete({
        where: {
          event_id: input.event_id,
        },
      });

      return { success: true };
    }),
});
