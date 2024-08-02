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
      return { class_id: newClass.class_id, class_name: newClass.class_name };
    }),

  removeClass: publicProcedure
    .input(z.object({
      user_id: z.number(),
      class_id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const classToDelete = await ctx.db.class.findFirst({
        where: {
          user_id: input.user_id,
          class_id: input.class_id,
        },
      });

      if (!classToDelete) {
        throw new Error("Class not found or not owned by user");
      }

      // Delete related chat messages
      await ctx.db.chatMessage.deleteMany({
        where: {
          chatHistory: {
            class_id: input.class_id,
          },
        },
      });

      // Delete related chat histories
      await ctx.db.chatHistory.deleteMany({
        where: {
          class_id: input.class_id,
        },
      });

      await ctx.db.session.deleteMany({
        where: {
          class_id: input.class_id,
        },
      });

      await ctx.db.class.delete({
        where: {
          class_id: input.class_id,
        },
      });

      return { success: true };
    }),
});
