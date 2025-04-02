import { categoriesRouter } from "./routers/categories-router";
import { commentReactionsRouter } from "./routers/comment-reactions-router";
import { commentRouter } from "./routers/comment-router";
import { playlistsRouter } from "./routers/playlists-router";
import { reactionRouter } from "./routers/reactions-router";
import { searchRouter } from "./routers/search-router";
import { studioRouter } from "./routers/studio-router";
import { subscriptionRouter } from "./routers/subscription-router";
import { suggestionRouter } from "./routers/suggestions-router";
import { userRouter } from "./routers/user-router";
import { videoRouter } from "./routers/videos-router";
import { viewsRouter } from "./routers/views-router";
import { createCallerFactory, router } from "./trpc";

export const appRouter = router({
  users: userRouter,
  views: viewsRouter,
  videos: videoRouter,
  studio: studioRouter,
  search: searchRouter,
  comments: commentRouter,
  reaction: reactionRouter,
  playlists: playlistsRouter,
  categories: categoriesRouter,
  suggestions: suggestionRouter,
  subscription: subscriptionRouter,
  commentReactions: commentReactionsRouter,
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
