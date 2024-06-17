import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const chatRouter = createTRPCRouter({
  getChatHistory: publicProcedure
    .input(z.object({
      user_id: z.number(),
      class_id: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      // Find the ChatHistory entry
      const chatHistory = await ctx.db.chatHistory.findFirst({
        where: {
          user_id: input.user_id,
          class_id: input.class_id,
        },
        include: {
          chatMessages: true, // Include the associated ChatMessages
        },
      });

      // If no entry is found, return an empty array
      if (!chatHistory) {
        return [];
      }

      // Return the chat messages
      return chatHistory.chatMessages;
    }),

  storeChatHistory: publicProcedure
    .input(z.object({
      user_id: z.number(),
      class_id: z.number(),
      content: z.string().min(1),
      sentByUser: z.boolean(), // Updated to boolean
      timestamp: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // Try to find an existing ChatHistory entry
      let chatHistory = await ctx.db.chatHistory.findFirst({
        where: {
          user_id: input.user_id,
          class_id: input.class_id,
        },
      });

      // If no entry is found, create a new one
      if (!chatHistory) {
        chatHistory = await ctx.db.chatHistory.create({
          data: {
            user_id: input.user_id,
            class_id: input.class_id,
            timestamp: input.timestamp,
          },
        });
      }

      // Create a new ChatMessage and connect it to the ChatHistory entry
      const newChatMessage = await ctx.db.chatMessage.create({
        data: {
          content: input.content,
          sentByUser: input.sentByUser, // Updated to boolean
          chat_id: chatHistory.chat_id,
        },
      });

      return newChatMessage;
    }),

  removeChatHistory: publicProcedure
    .input(z.object({
      chat_id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Find the ChatHistory entry
      const chatHistory = await ctx.db.chatHistory.findFirst({
        where: {
          chat_id: input.chat_id,
        },
      });

      // If no entry is found, throw an error
      if (!chatHistory) {
        throw new Error('Chat history not found');
      }

      // Delete the chat history
      await ctx.db.chatHistory.delete({
        where: {
          chat_id: chatHistory.chat_id,
        },
      });

      return { message: 'Chat history removed successfully' };
    }),

  getChatHistoryByClassId: publicProcedure
    .input(z.object({
      class_id: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      // Find the ChatHistory entries
      const chatHistories = await ctx.db.chatHistory.findMany({
        where: {
          class_id: input.class_id,
        },
        include: {
          chatMessages: true, // Include the associated ChatMessages
        },
      });

      // If no entries are found, return an empty array
      if (!chatHistories || chatHistories.length === 0) {
        return [];
      }

      // Return the chat histories
      return chatHistories;
    }),
});