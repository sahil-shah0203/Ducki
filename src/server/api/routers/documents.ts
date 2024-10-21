import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const documentsRouter = createTRPCRouter({
  getDocumentsByGroupId: publicProcedure
    .input(
      z.object({
        group_id: z.string(), 
      }),
    )
    .query(async ({ ctx, input }) => {
      const documents = await ctx.db.document.findMany({
        where: {
          group_id: input.group_id, 
        },
      });

      return documents.map((document) => ({
        id: document.document_id, 
        url: document.url,
        name: document.name,
      }));
    }),

  addDocument: publicProcedure

    .input(z.object({
      document_id: z.string(), // UUID-based document ID
      url: z.string(), // S3 URL
      name: z.string(), // Original file name
      userId: z.number(),
      classId: z.number(),
      group_id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.db.document.create({
        data: {
          document_id: input.document_id, // UUID-based document ID
          url: input.url, // S3 URL
          name: input.name, // Original file name
          user_id: input.userId,
          class_id: input.classId,
          group_id: input.group_id,
        },
      });

      return document;
    }),

  deleteDocument: publicProcedure
    .input(
      z.object({
        documentId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.db.document.findUnique({
        where: { document_id: input.documentId },
      });

      if (!document) {
        throw new Error("Document not found");
      }

      // Delete the document from S3
      const s3Params = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: document.url.split("/").pop(), // Assuming URL contains the file key at the end
      };

      const command = new DeleteObjectCommand(s3Params);
      await s3.send(command);

      // Delete the document from the database
      await ctx.db.document.delete({
        where: { document_id: input.documentId },
      });

      return { success: true };
    }),
});
