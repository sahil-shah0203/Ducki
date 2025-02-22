import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const keyConceptRouter = createTRPCRouter({
  getKeyConcepts: publicProcedure
    .input(
      z.object({
        group_id: z.string(),
        class_id: z.number(),
        user_id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { group_id, class_id, user_id } = input;

      const keyConcepts = await ctx.db.keyConcept.findMany({
        where: {
          group_id,
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

      const response = await fetch(`https://ducki.ai/api/getKeyConcepts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          class_id: class_id,
          session: group_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error fetching key concepts: ${response.statusText}`);
      }

      const data = await response.json();

      const parsedObject = JSON.parse(data.concepts);

      if (!parsedObject.concepts) {
        throw new Error(`Error fetching key concepts:`);
      }

      const parsedData = parsedObject.concepts;

      let content: Array<{
        concept_id: number | null;
        description: string;
        understanding_level: number;
        subconcepts: string[];
      }> = [];

      if (Array.isArray(parsedData)) {
        content = parsedData.map(
          (topic: { concept: string; subconcepts: string[] }) => ({
            concept_id: null,
            description: topic.concept,
            understanding_level: 1,
            subconcepts: topic.subconcepts,
          }),
        );
      } else {
        throw new Error("Unexpected format of key_concepts data");
      }

      for (const item of content) {
        const createdConcept = await ctx.db.keyConcept.create({
          data: {
            description: item.description,
            group_id: group_id,
            class_id: class_id,
            user_id: user_id,
            understanding_level: 1,
            subconcepts: item.subconcepts,
          },
        });

        item.concept_id = createdConcept.concept_id;
      }

      console.log("222", content);

      return content;
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
        group_id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { description, user_id, class_id, group_id } = input;

      const understanding_level = 1; // Default level of understanding

      const subconcepts: string[] = [];

      const newConcept = await ctx.db.keyConcept.create({
        data: {
          description,
          user_id,
          class_id,
          group_id,
          understanding_level,
          subconcepts,
        },
      });

      return {
        message: `Key concept created successfully.`,
        newConcept,
      };
    }),

  updateUnderstanding: publicProcedure
    .input(z.record(z.string(), z.number()))
    .mutation(async ({ ctx, input }) => {
      const conceptIds = Object.keys(input).map(Number);
      const updatePromises = conceptIds.map(async (concept_id) => {
        const understanding_level = input[concept_id];

        const updatedConcept = await ctx.db.keyConcept.update({
          where: {
            concept_id: Number(concept_id),
          },
          data: {
            understanding_level: understanding_level,
          },
        });

        return updatedConcept;
      });

      const updatedConcepts = await Promise.all(updatePromises);

      return {
        message: "Understanding levels updated successfully.",
        updatedConcepts,
      };
    }),
});
