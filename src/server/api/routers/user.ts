// import { z } from "zod";
// import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// export const userRouter = createTRPCRouter({
//   getEmail: publicProcedure
//     .input(z.object({ userId: z.number() })) // Input validation with zod
//     .query(async ({ input }) => {
//       const user = await prisma.user.findUnique({
//         where: { user_id: input.userId },
//         select: { email: true }, // Only select the email field
//       });

//       if (!user) {
//         throw new Error("User not found");
//       }

//       return user.email;
//     }),

// });
