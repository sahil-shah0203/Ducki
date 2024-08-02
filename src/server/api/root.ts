import { userRouter } from "./routers/user";
import { classRouter } from "./routers/class";
import { chatRouter } from "./routers/chats";
import { sessionRouter } from "./routers/session";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { eventsRouter } from "./routers/events";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  class: classRouter,
  chats: chatRouter,
  session: sessionRouter,
  events: eventsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);