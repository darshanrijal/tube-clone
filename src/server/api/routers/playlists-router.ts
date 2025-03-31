import { DEFAULT_PAGINATION_LIMIT } from "@/constants";
import { db } from "@/db";
import { users, videoReactions, videoViews, videos } from "@/db/schema";
import { and, desc, eq, getTableColumns } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const playlistsRouter = router({
  getHistory: protectedProcedure
    .input(
      z.object({
        pagesize: z.number().default(DEFAULT_PAGINATION_LIMIT),
        cursor: z.number().int().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { pagesize, cursor } = input;
      const offset = cursor ?? 0;
      const userId = ctx.user.id;

      const viewerVideoViews = db.$with("viewer_video_views").as(
        db
          .select({
            videoId: videoViews.videoId,
            viewedAt: videoViews.updatedAt,
            userId: videoViews.userId,
          })
          .from(videoViews)
          .where(eq(videoViews.userId, userId))
      );

      const result = await db
        .with(viewerVideoViews)
        .select({
          ...getTableColumns(videos),
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like")
            )
          ),
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike")
            )
          ),
          user: {
            id: users.id,
            name: users.name,
            imageUrl: users.imageUrl,
          },
          viewedAt: viewerVideoViews.viewedAt,
        })
        .from(videos)
        .where(eq(viewerVideoViews.userId, userId))
        .innerJoin(users, eq(videos.userId, users.id))
        .innerJoin(viewerVideoViews, eq(viewerVideoViews.videoId, videos.id))
        .limit(pagesize + 1)
        .offset(offset)
        .orderBy(desc(viewerVideoViews.viewedAt));

      const nextCursor = result.length > pagesize ? pagesize + offset : null;

      const data = {
        videos: result.slice(0, pagesize),
        nextCursor,
      };

      return data;
    }),
  getLiked: protectedProcedure
    .input(
      z.object({
        pagesize: z.number().default(DEFAULT_PAGINATION_LIMIT),
        cursor: z.number().int().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { pagesize, cursor } = input;
      const offset = cursor ?? 0;
      const userId = ctx.user.id;

      const viewerVideoReactions = db.$with("viewer_video_reactions").as(
        db
          .select({
            videoId: videoReactions.videoId,
            reactedAt: videoReactions.createdAt,
            userId: videoReactions.userId,
          })
          .from(videoReactions)
          .where(
            and(
              eq(videoReactions.userId, userId),
              eq(videoReactions.type, "like")
            )
          )
      );

      const result = await db
        .with(viewerVideoReactions)
        .select({
          ...getTableColumns(videos),
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like")
            )
          ),
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike")
            )
          ),
          user: {
            id: users.id,
            name: users.name,
            imageUrl: users.imageUrl,
          },
          likedAt: viewerVideoReactions.reactedAt,
        })
        .from(videos)
        .where(eq(viewerVideoReactions.userId, userId))
        .innerJoin(users, eq(videos.userId, users.id))
        .innerJoin(
          viewerVideoReactions,
          eq(viewerVideoReactions.videoId, videos.id)
        )
        .limit(pagesize + 1)
        .offset(offset)
        .orderBy(desc(viewerVideoReactions.reactedAt));

      const nextCursor = result.length > pagesize ? pagesize + offset : null;

      const data = {
        videos: result.slice(0, pagesize),
        nextCursor,
      };

      return data;
    }),
});
