import { DEFAULT_PAGINATION_LIMIT } from "@/constants";
import { db } from "@/db";
import {
  playlistTable,
  playlistToVideo,
  userTable,
  videoReactionTable,
  videoTable,
  videoViewTable,
} from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, exists, getTableColumns, sql } from "drizzle-orm";
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

  getOne: protectedProcedure
    .input(z.object({ playlistId: z.string().cuid2() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { playlistId } = input;

      const [existingPlaylist] = await db
        .select()
        .from(playlistTable)
        .where(
          and(
            eq(playlistTable.id, playlistId),
            eq(playlistTable.userId, userId)
          )
        );

      if (!existingPlaylist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No playlist found",
        });
      }

      return existingPlaylist;
    }),

  remove: protectedProcedure
    .input(z.object({ playlistId: z.string().cuid2() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { playlistId } = input;

      const [deletedPlaylist] = await db
        .delete(playlistTable)
        .where(
          and(
            eq(playlistTable.id, playlistId),
            eq(playlistTable.userId, userId)
          )
        )
        .returning();

      if (!deletedPlaylist?.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist doesnot exist",
        });
      }
    }),
  getVideos: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().cuid2(),
        pagesize: z.number().default(DEFAULT_PAGINATION_LIMIT),
        cursor: z.number().int().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { pagesize, cursor, playlistId } = input;
      const offset = cursor ?? 0;
      const userId = ctx.user.id;

      const videosFromPlaylist = db.$with("playlist_videos").as(
        db
          .select({
            videoId: playlistToVideo.videoId,
          })
          .from(playlistToVideo)
          .where(eq(playlistToVideo.playlistId, playlistId))
      );

      const [existingPlaylist] = await db
        .select()
        .from(playlistTable)
        .where(
          and(
            eq(playlistTable.id, playlistId),
            eq(playlistTable.userId, userId)
          )
        );

      if (!existingPlaylist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "This playlist is not available",
        });
      }

      const result = await db
        .with(videosFromPlaylist)
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
        })
        .from(videoTable)
        .where(eq(videoTable.visibility, "PUBLIC"))
        .innerJoin(userTable, eq(videoTable.userId, userTable.id))
        .innerJoin(
          videosFromPlaylist,
          eq(videosFromPlaylist.videoId, videoTable.id)
        )
        .limit(pagesize + 1)
        .offset(offset)
        .orderBy(desc(videoTable.updatedAt));

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
  create: protectedProcedure
    .input(z.object({ name: z.string().nonempty().trim() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const { name } = input;

      await db.insert(playlistTable).values({
        name,
        userId,
      });
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(DEFAULT_PAGINATION_LIMIT),
        cursor: z.number().int().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      const offset = cursor ?? 0;
      const userId = ctx.user.id;

      const latestVideoThumbnailSubquery = db
        .select({
          playlistId: playlistToVideo.playlistId,
          thumbnailUrl: videoTable.thumbnailUrl,
        })
        .from(playlistToVideo)
        .innerJoin(videoTable, eq(playlistToVideo.videoId, videoTable.id))
        .orderBy(desc(playlistToVideo.createdAt))
        .as("latest_videos");

      const playlists = await db
        .select({
          ...getTableColumns(playlistTable),
          videoCount: sql<number>`count(${playlistToVideo.videoId})`.as(
            "video_count"
          ),
          latestVideoThumbnail: sql<string | null>`(
            SELECT ${latestVideoThumbnailSubquery.thumbnailUrl}
            FROM ${latestVideoThumbnailSubquery}
            WHERE ${latestVideoThumbnailSubquery.playlistId} = ${playlistTable.id}
            LIMIT 1
          )`.as("latest_video_thumbnail"),
        })
        .from(playlistTable)
        .leftJoin(
          playlistToVideo,
          eq(playlistToVideo.playlistId, playlistTable.id)
        )
        .where(eq(playlistTable.userId, userId))
        .groupBy(playlistTable.id)
        .orderBy(desc(playlistTable.updatedAt))
        .limit(limit)
        .offset(offset);

      const nextCursor = playlists.length === limit ? offset + limit : null;

      return {
        playlists,
        nextCursor,
      };
    }),
  getManyForVideo: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(DEFAULT_PAGINATION_LIMIT),
        cursor: z.number().int().nullish(),
        videoId: z.string().cuid2(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, videoId } = input;
      const offset = cursor ?? 0;
      const userId = ctx.user.id;
      const playlists = await db
        .select({
          ...getTableColumns(playlistTable),
          videoCount: db.$count(
            playlistToVideo,
            eq(playlistToVideo.playlistId, playlistTable.id)
          ),
          containsVideo: exists(
            db
              .select()
              .from(playlistToVideo)
              .where(
                and(
                  eq(playlistToVideo.playlistId, playlistTable.id),
                  eq(playlistToVideo.videoId, videoId)
                )
              )
          ).mapWith(Boolean),
        })
        .from(playlistTable)
        .where(eq(playlistTable.userId, userId))
        .offset(offset)
        .limit(limit)
        .orderBy(desc(playlistTable.updatedAt));

      const nextCursor = playlists.length === limit ? offset + limit : null;

      const data = {
        playlists,
        nextCursor,
      };

      return data;
    }),
  addVideo: protectedProcedure
    .input(
      z.object({ playlistId: z.string().cuid2(), videoId: z.string().cuid2() })
    )
    .mutation(async ({ input }) => {
      const [data] = await db.insert(playlistToVideo).values(input).returning();

      if (!data) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not add video to the playlist",
        });
      }
      return {
        playlistId: data.playlistId,
      };
    }),
  removeVideo: protectedProcedure
    .input(
      z.object({ playlistId: z.string().cuid2(), videoId: z.string().cuid2() })
    )
    .mutation(async ({ input }) => {
      const { playlistId, videoId } = input;
      const [deletedItem] = await db
        .delete(playlistToVideo)
        .where(
          and(
            eq(playlistToVideo.videoId, videoId),
            eq(playlistToVideo.playlistId, playlistId)
          )
        )
        .returning();

      if (!deletedItem) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Video is not in playlist, nothing to delete",
        });
      }

      return deletedItem;
    }),
});
