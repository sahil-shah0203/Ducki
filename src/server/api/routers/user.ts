import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getUserByEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        firstName: z.string(),
        lastName: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { email, firstName, lastName } = input;

      const user = await ctx.db.user.upsert({
        where: { email },
        update: {
          first_name: firstName,
          last_name: lastName,
        },
        create: {
          email,
          first_name: firstName,
          last_name: lastName,
        },
      });

      return { user_id: user.user_id };
    }),

  deleteUser: publicProcedure
    .input(
      z.object({
        userId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;

      await ctx.db.chatMessage.deleteMany({
        where: {
          chatHistory: {
            user_id: userId,
          },
        },
      });

      await ctx.db.chatHistory.deleteMany({
        where: { user_id: userId },
      });

      await ctx.db.session.deleteMany({
        where: { user_id: userId },
      });

      await ctx.db.class.deleteMany({
        where: { user_id: userId },
      });

      await ctx.db.user.delete({
        where: { user_id: userId },
      });

      return { success: true };
    }),
});
