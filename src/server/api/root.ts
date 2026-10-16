import { createTRPCRouter } from "./trpc";
import { moderationRouter } from "./routers/moderation";
import { postsRouter } from "./routers/posts";

export const appRouter = createTRPCRouter({
  moderation: moderationRouter,
  posts: postsRouter,
});

export type AppRouter = typeof appRouter;
