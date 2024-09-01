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
          understanding_level: true,
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
        understanding_level: number;
      }> = [];

      if (Array.isArray(parsedObject.main_topics)) {
        parsedData = parsedObject.main_topics.map(
          (topic: { description: string; understanding_level: number }) => ({
            concept_id: null,
            description: topic.description,
          }),
        );
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
            understanding_level: 1,
          },
        });

        item.concept_id = createdConcept.concept_id;
      }

      return parsedData;
    }),

  deleteKeyConcept: publicProcedure
    .input(
      z.object({
        concept_id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { concept_id } = input;

      const deletedConcept = await ctx.db.keyConcept.delete({
        where: {
          concept_id: concept_id,
        },
      });

      // Return the deleted concept's information or a success message
      return {
        message: `Key concept with ID ${concept_id} was deleted successfully.`,
        deletedConcept,
      };
    }),

  editConcept: publicProcedure
    .input(
      z.object({
        concept_id: z.number(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { concept_id, description } = input;

      const updatedConcept = await ctx.db.keyConcept.update({
        where: {
          concept_id: concept_id,
        },
        data: {
          description: description,
        },
      });

      return {
        message: `Key concept with ID ${concept_id} was updated successfully.`,
        updatedConcept,
      };
    }),

  createKeyConcept: publicProcedure
    .input(
      z.object({
        description: z.string(),
        user_id: z.number(),
        class_id: z.number(),
        session_id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { description, user_id, class_id, session_id } = input;

      const understanding_level = 1; // Default level of understanding

      const newConcept = await ctx.db.keyConcept.create({
        data: {
          description,
          user_id,
          class_id,
          session_id,
          understanding_level,
        },
      });

      return {
        message: `Key concept created successfully.`,
        newConcept,
      };
    }),
});
