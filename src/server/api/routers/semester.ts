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

// Semester router for handling semester-related CRUD operations
export const semesterRouter = createTRPCRouter({
  // Fetch all semesters for a specific user
  getSemestersByUserId: publicProcedure
    .input(z.object({ user_id: z.number() }))
    .query(async ({ ctx, input }) => {
      const semesters = await ctx.db.semester.findMany({
        where: {
          classes: {
            some: {
              user_id: input.user_id,
            },
          },
        },
      });
      return semesters;
    }),

  // Add a new semester for a user
  addSemester: publicProcedure
    .input(
      z.object({
        semester_name: z.string().min(1),
        start_date: z.date(),
        end_date: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newSemester = await ctx.db.semester.create({
        data: {
          semester_name: input.semester_name,
          start_date: input.start_date,
          end_date: input.end_date,
        },
      });
      return {
        semester_id: newSemester.semester_id,
        semester_name: newSemester.semester_name,
      };
    }),

  // Remove a semester and all related data
  removeSemester: publicProcedure
    .input(
      z.object({
        semester_id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const semesterToDelete = await ctx.db.semester.findFirst({
        where: {
          semester_id: input.semester_id,
        },
      });

      if (!semesterToDelete) {
        throw new Error("Semester not found");
      }

      // Find all classes related to the semester
      const classes = await ctx.db.class.findMany({
        where: {
          semester_id: input.semester_id,
        },
      });

      for (const classItem of classes) {
        // Delete related documents from S3 for each class
        const documents = await ctx.db.document.findMany({
          where: {
            class_id: classItem.class_id,
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
            class_id: classItem.class_id,
          },
        });

        // Delete related chat messages
        await ctx.db.chatMessage.deleteMany({
          where: {
            chatHistory: {
              class_id: classItem.class_id,
            },
          },
        });

        await ctx.db.chatHistory.deleteMany({
          where: {
            class_id: classItem.class_id,
          },
        });

        await ctx.db.keyConcept.deleteMany({
          where: {
            class_id: classItem.class_id,
          },
        });

        await ctx.db.session.deleteMany({
          where: {
            class_id: classItem.class_id,
          },
        });
      }

      // Delete classes related to the semester
      await ctx.db.class.deleteMany({
        where: {
          semester_id: input.semester_id,
        },
      });

      // Delete the semester itself
      await ctx.db.semester.delete({
        where: {
          semester_id: input.semester_id,
        },
      });

      return { success: true };
    }),
});
