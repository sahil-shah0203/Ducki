import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const classRouter = createTRPCRouter({
  getClassesByUserId: publicProcedure
    .input(z.object({ user_id: z.number() }))
    .query(async ({ ctx, input }) => {
      const classes = await ctx.db.class.findMany({
        where: {
          user_id: input.user_id,
        },
      });
      return classes;
    }),

  addClass: publicProcedure
    .input(z.object({
      user_id: z.number(),
      class_name: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const newClass = await ctx.db.class.create({
        data: {
          user_id: input.user_id,
          class_name: input.class_name,
        },
      });
      return newClass;
    }),
});
