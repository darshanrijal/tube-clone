import { DEFAULT_PAGINATION_LIMIT } from "@/constants";
import { db } from "@/db";
import {
  userTable,
  videoReactionTable,
  videoTable,
  videoViewTable,
} from "@/db/schema";
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
            videoId: videoViewTable.videoId,
            viewedAt: videoViewTable.updatedAt,
            userId: videoViewTable.userId,
          })
          .from(videoViewTable)
          .where(eq(videoViewTable.userId, userId))
      );

      const result = await db
        .with(viewerVideoViews)
        .select({
          ...getTableColumns(videoTable),
          viewCount: db.$count(
            videoViewTable,
            eq(videoViewTable.videoId, videoTable.id)
          ),
          likeCount: db.$count(
            videoReactionTable,
            and(
              eq(videoReactionTable.videoId, videoTable.id),
              eq(videoReactionTable.type, "like")
            )
          ),
          dislikeCount: db.$count(
            videoReactionTable,
            and(
              eq(videoReactionTable.videoId, videoTable.id),
              eq(videoReactionTable.type, "dislike")
            )
          ),
          user: {
            id: userTable.id,
            name: userTable.name,
            imageUrl: userTable.imageUrl,
          },
          viewedAt: viewerVideoViews.viewedAt,
        })
        .from(videoTable)
        .where(eq(viewerVideoViews.userId, userId))
        .innerJoin(userTable, eq(videoTable.userId, userTable.id))
        .innerJoin(
          viewerVideoViews,
          eq(viewerVideoViews.videoId, videoTable.id)
        )
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
            videoId: videoReactionTable.videoId,
            reactedAt: videoReactionTable.createdAt,
            userId: videoReactionTable.userId,
          })
          .from(videoReactionTable)
          .where(
            and(
              eq(videoReactionTable.userId, userId),
              eq(videoReactionTable.type, "like")
            )
          )
      );

      const result = await db
        .with(viewerVideoReactions)
        .select({
          ...getTableColumns(videoTable),
          viewCount: db.$count(
            videoViewTable,
            eq(videoViewTable.videoId, videoTable.id)
          ),
          likeCount: db.$count(
            videoReactionTable,
            and(
              eq(videoReactionTable.videoId, videoTable.id),
              eq(videoReactionTable.type, "like")
            )
          ),
          dislikeCount: db.$count(
            videoReactionTable,
            and(
              eq(videoReactionTable.videoId, videoTable.id),
              eq(videoReactionTable.type, "dislike")
            )
          ),
          user: {
            id: userTable.id,
            name: userTable.name,
            imageUrl: userTable.imageUrl,
          },
          likedAt: viewerVideoReactions.reactedAt,
        })
        .from(videoTable)
        .where(eq(viewerVideoReactions.userId, userId))
        .innerJoin(userTable, eq(videoTable.userId, userTable.id))
        .innerJoin(
          viewerVideoReactions,
          eq(viewerVideoReactions.videoId, videoTable.id)
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
