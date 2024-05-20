import { createRouter } from '~/trpc/createRouter';
import { userRouter } from './user';
import { classRouter } from './class';

export const appRouter = createRouter()
  .merge('user.', userRouter)
  .merge('class.', classRouter);

export type AppRouter = typeof appRouter;
