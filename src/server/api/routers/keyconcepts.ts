import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const keyConceptRouter = createTRPCRouter({
  getKeyConcepts: publicProcedure
    .input(
      z.object({
        session_id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { session_id } = input;

      const keyConcepts = await ctx.db.keyConcept.findMany({
        where: {
          session_id,
        },
        select: {
          concept_id: true,
          description: true,
        },
      });

      return keyConcepts;
    }),
});
