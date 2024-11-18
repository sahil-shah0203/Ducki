import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const groupRouter = createTRPCRouter({
    getGroupsByClassId: publicProcedure
        .input(z.object({ class_id: z.number() }))
        .query(async ({ ctx, input }) => {
            const groups = await db.group.findMany({
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

            return groups.map((group: { group_id: string; group_title: string; createdAt: Date }) => ({
                id: group.group_id,
                title: group.group_title,
                date: formatDate(group.createdAt),
            }));
        }),
    addGroup: publicProcedure
        .input(z.object({
            user_id: z.number(),
            class_id: z.number(),
            class_name: z.string(),
            group_id: z.string(),
            group_title: z.string(),
        }))
        .mutation(async ({ input }) => {
            const newGroup = await db.group.create({
                data: {
                    group_id: input.group_id,
                    user_id: input.user_id,
                    class_id: input.class_id,
                    group_title: input.group_title,
                    class_name: input.class_name,
                    createdAt: new Date(),
                },
            });
            return { group_id: newGroup.group_id, class_id: newGroup.class_id, class_name: newGroup.class_name, createdAt: newGroup.createdAt };
        }),
});