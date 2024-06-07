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

  removeClass: publicProcedure
    .input(z.object({
      user_id: z.number(),
      class_name: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const classToRemove = await ctx.db.class.findFirst({
        where: {
          class_name: input.class_name,
          user_id: input.user_id,
        },
      });

      if (!classToRemove) {
        throw new Error('Class not found or you are not authorized to delete this class');
      }

      await ctx.db.class.delete({
        where: {
          class_id: classToRemove.class_id,
        },
      });

      return { message: 'Class removed successfully' };
    }),
});
