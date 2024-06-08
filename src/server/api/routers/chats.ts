import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const chatRouter = createTRPCRouter({
  // ... existing procedures ...

  storeChatHistory: publicProcedure
    .input(z.object({
      user_id: z.number(),
      class_id: z.number(),
      content: z.string().min(1),
      direction: z.string().min(1),
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
          direction: input.direction,
          chat_id: chatHistory.chat_id,
        },
      });

      return newChatMessage;
    }),
});