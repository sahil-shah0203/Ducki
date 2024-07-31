import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const sessionRouter = createTRPCRouter({
  getSessionsByClassId: publicProcedure
    .input(z.object({ class_id: z.number() }))
    .query(async ({ ctx, input }) => {
      const sessions = await db.session.findMany({
        where: {
          class_id: input.class_id,
        },
        include: {
          class: true,
        },
      });

      const formatDate = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Intl.DateTimeFormat('en-US', options).format(date);
      };

      return sessions.map((session: { session_id: string; session_title: string; createdAt: Date }) => ({
        id: session.session_id,
        title: session.session_title,
        date: formatDate(session.createdAt), 
      }));
    }),
  addSession: publicProcedure
    .input(z.object({
      user_id: z.number(),
      class_id: z.number(),
      session_id: z.string(),
      session_title: z.string(), // Include session_title in the input schema
    }))
    .mutation(async ({ input }) => {
      const newSession = await db.session.create({
        data: {
          session_id: input.session_id,
          user_id: input.user_id,
          class_id: input.class_id,
          session_title: input.session_title, // Include session_title in the data
          createdAt: new Date(),
        },
      });
      return { session_id: newSession.session_id, class_id: newSession.class_id, createdAt: newSession.createdAt };
    }),
  getChatHistoryBySessionId: publicProcedure
    .input(z.object({ session_id: z.string() }))
    .query(async ({ input }) => {
      const chatHistory = await db.chatHistory.findMany({
        where: {
          session_id: input.session_id,
        },
        include: {
          chatMessages: true,
        },
      });

      if (!chatHistory) {
        throw new Error('Chat history not found');
      }

      return chatHistory.flatMap(history => history.chatMessages).map(message => ({
        content: message.content,
        sentByUser: message.sentByUser,
        timestamp: message.timestamp,
      }));
    }),
  storeChatMessage: publicProcedure
    .input(z.object({
      content: z.string(),
      sentByUser: z.boolean(),
      timestamp: z.string(),
      sessionId: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Find the associated ChatHistory for the session
      let chatHistory = await db.chatHistory.findFirst({
        where: {
          session_id: input.sessionId,
        },
      });

      // If no ChatHistory exists for the session, create one
      if (!chatHistory) {
        chatHistory = await db.chatHistory.create({
          data: {
            session_id: input.sessionId,
            timestamp: new Date(input.timestamp),
            user_id: 1, // Replace with the actual user ID
            class_id: 1, // Replace with the actual class ID
          },
        });
      }

      // Create the ChatMessage associated with the ChatHistory
      const newMessage = await db.chatMessage.create({
        data: {
          content: input.content,
          sentByUser: input.sentByUser,
          timestamp: new Date(input.timestamp),
          chat_id: chatHistory.chat_id,
        },
      });

      return newMessage;
    }),
});