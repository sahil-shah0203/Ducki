import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
    getUserByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.upsert({
        where: { email: input.email },
        update: {}, // If the user exists, don't change anything
        create: {
          email: input.email,
          first_name: "", // Default values if not provided
          last_name: "",
        },
      });

      return { user_id: user.user_id };
    }),
});
