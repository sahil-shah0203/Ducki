import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const keyConceptRouter = createTRPCRouter({
  getKeyConcepts: publicProcedure
    .input(
      z.object({
        session_id: z.string(),
        class_id: z.number(),
        user_id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { session_id, class_id, user_id } = input;

      const keyConcepts = await ctx.db.keyConcept.findMany({
        where: {
          session_id,
        },
        select: {
          concept_id: true,
          description: true,
        },
      });

      if (keyConcepts.length > 0) {
        return keyConcepts;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/getKeyConcepts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            class_id: class_id,
            session: session_id,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Error fetching key concepts: ${response.statusText}`);
      }

      const data = await response.json();

      const parsedObject = JSON.parse(data.concepts);

      let parsedData: Array<{
        concept_id: number | null;
        description: string;
      }> = [];

      if (Array.isArray(parsedObject.main_topics)) {
        parsedData = parsedObject.main_topics.map((description: string) => ({
          concept_id: null,
          description,
        }));
      } else {
        throw new Error("Unexpected format of main_topics data");
      }

      for (const item of parsedData) {
        const createdConcept = await ctx.db.keyConcept.create({
          data: {
            description: item.description,
            session_id: session_id,
            class_id: class_id,
            user_id: user_id,
          },
        });

        item.concept_id = createdConcept.concept_id;
      }

      return parsedData;
    }),
});
