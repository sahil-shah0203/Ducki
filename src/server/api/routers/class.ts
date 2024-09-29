import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const classRouter = createTRPCRouter({
  // Fetch all classes for a specific user
  getClassesByUserId: publicProcedure
    .input(z.object({ user_id: z.number() }))
    .query(async ({ ctx, input }) => {
      const classes = await ctx.db.class.findMany({
        where: {
          user_id: input.user_id,
        },
        include: {
          semester: true, // Include semester information if needed
        },
      });
      return classes;
    }),

  // Fetch all classes for a specific user and semester
  getClassesBySemesterId: publicProcedure
    .input(
      z.object({
        user_id: z.number(),
        semester_id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const classes = await ctx.db.class.findMany({
        where: {
          user_id: input.user_id,
          semester_id: input.semester_id,
        },
      });
      return classes;
    }),

  // Add a new class for a user within a specific semester
  addClass: publicProcedure
    .input(
      z.object({
        user_id: z.number(),
        semester_id: z.number(), // Include semester_id in input
        class_name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newClass = await ctx.db.class.create({
        data: {
          user_id: input.user_id,
          semester_id: input.semester_id, // Save semester_id
          class_name: input.class_name,
        },
      });
      return {
        class_id: newClass.class_id,
        class_name: newClass.class_name,
        semester_id: newClass.semester_id,
      };
    }),

  // Remove a class along with related data and files
  removeClass: publicProcedure
    .input(
      z.object({
        user_id: z.number(),
        class_id: z.number(),
      }),
    )
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

      // Find and delete related documents from S3
      const documents = await ctx.db.document.findMany({
        where: {
          class_id: input.class_id,
        },
      });

      for (const document of documents) {
        const s3Params = {
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: document.url.split("/").pop(), // Assuming URL contains the file key at the end
        };
        const command = new DeleteObjectCommand(s3Params);
        await s3.send(command);
      }

      // Delete related documents from the database
      await ctx.db.document.deleteMany({
        where: {
          class_id: input.class_id,
        },
      });

      // Delete related chat messages
      await ctx.db.chatMessage.deleteMany({
        where: {
          chatHistory: {
            class_id: input.class_id,
          },
        },
      });

      await ctx.db.chatHistory.deleteMany({
        where: {
          class_id: input.class_id,
        },
      });

      await ctx.db.keyConcept.deleteMany({
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
