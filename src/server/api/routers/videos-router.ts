import { DEFAULT_PAGINATION_LIMIT } from "@/constants";
import { db } from "@/db";
import {
  subscriptions,
  users,
  videoReactions,
  videoViews,
  videos,
} from "@/db/schema";
import { mux } from "@/lib/mux";
import { updateVideoSchema } from "@/lib/validation";
import { TRPCError } from "@trpc/server";
import { desc } from "drizzle-orm";
import { and, eq, getTableColumns, inArray, isNotNull } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const videoRouter = router({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;

    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId,
        playback_policy: ["public"],
        input: [
          {
            generated_subtitles: [
              {
                language_code: "en",
                name: "English",
              },
            ],
          },
        ],
      },
      cors_origin: "*",
    });
    const [video] = await db
      .insert(videos)
      .values({
        title: "UNTITLED",
        userId,
        muxStatus: "waiting",
        muxUploadId: upload.id,
      })
      .returning({ id: videos.id });

    if (!video) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create video",
      });
    }

    return { url: upload.url, videoId: video.id };
  }),
  update: protectedProcedure
    .input(updateVideoSchema.and(z.object({ videoId: z.string().cuid2() })))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const { videoId, ...values } = input;
      const [updatedVideo] = await db
        .update(videos)
        .set(values)
        .where(and(eq(videos.userId, userId), eq(videos.id, videoId)))
        .returning({ id: videos.id });

      if (!updatedVideo?.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No video updated" });
      }
    }),
  remove: protectedProcedure
    .input(z.object({ videoId: z.string().cuid2() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { videoId } = input;

      const [deletedVideo] = await db
        .delete(videos)
        .where(and(eq(videos.userId, userId), eq(videos.id, videoId)))
        .returning();

      if (!deletedVideo?.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Video could not be deleted",
        });
      }

      const { thumbnailKey, previewKey } = deletedVideo;
      if (previewKey) {
        await new UTApi().deleteFiles([previewKey]);
      }

      if (thumbnailKey) {
        await new UTApi().deleteFiles([thumbnailKey]);
      }
    }),
  restoreThumbnail: protectedProcedure
    .input(z.object({ videoId: z.string().cuid2() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const [video] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.userId, userId), eq(videos.id, input.videoId)));

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }

      const { thumbnailKey } = video;

      if (thumbnailKey) {
        await new UTApi().deleteFiles([thumbnailKey]);
      }

      if (!video.muxPlaybackId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No playback id" });
      }

      const thumbnailUrl = `https://image.mux.com/${video.muxPlaybackId}/thumbnail.jpg`;
      const { data, error } = await new UTApi().uploadFilesFromUrl(
        thumbnailUrl
      );

      if (error) {
        throw new TRPCError({
          code: "UNSUPPORTED_MEDIA_TYPE",
          message: error.message,
        });
      }

      await db
        .update(videos)
        .set({
          thumbnailUrl: data.ufsUrl,
          thumbnailKey: data.key,
        })
        .where(eq(videos.id, video.id));
    }),
  getVideo: publicProcedure
    .input(z.object({ videoId: z.string().cuid2() }))
    .query(async ({ input, ctx }) => {
      const { videoId } = input;

      const { clerkId } = ctx;

      let userId: string | undefined;

      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(inArray(users.clerkId, clerkId ? [clerkId] : []));

      if (user) {
        userId = user.id;
      }

      const viewerReaction = db.$with("viewer_reactions").as(
        db
          .select({
            videoId: videoReactions.videoId,
            type: videoReactions.type,
          })
          .from(videoReactions)
          .where(inArray(videoReactions.userId, userId ? [userId] : []))
      );
      const viewerSubscriptions = db.$with("viewer_subscriptions").as(
        db
          .select()
          .from(subscriptions)
          .where(inArray(subscriptions.viewerId, userId ? [userId] : []))
      );
      const [video] = await db
        .with(viewerReaction, viewerSubscriptions)
        .select({
          ...getTableColumns(videos),
          user: {
            id: users.id,
            clerkId: users.clerkId,
            name: users.name,
            imageUrl: users.imageUrl,
            isSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(
              Boolean
            ),
            subscribers: db.$count(
              subscriptions,
              eq(subscriptions.creatorId, users.id)
            ),
          },
          views: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likes: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like")
            )
          ),
          dislikes: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike")
            )
          ),
          reaction: viewerReaction.type,
        })
        .from(videos)
        .where(eq(videos.id, videoId))
        .innerJoin(users, eq(videos.userId, users.id))
        .leftJoin(viewerReaction, eq(viewerReaction.videoId, videos.id))
        .leftJoin(
          viewerSubscriptions,
          eq(viewerSubscriptions.creatorId, users.id)
        );

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }

      return video;
    }),
  revalidate: protectedProcedure
    .input(z.object({ videoId: z.string().cuid2() }))
    .mutation(async ({ ctx, input }) => {
      const [video] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, input.videoId));

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }

      const directUpload = await mux.video.uploads.retrieve(video.muxUploadId);

      if (!directUpload?.asset_id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const asset = await mux.video.assets.retrieve(directUpload.asset_id);
      const duration = asset.duration ? Math.round(asset.duration * 1000) : 0;
      await db
        .update(videos)
        .set({
          muxStatus: asset.status,
          muxPlaybackId: asset.playback_ids?.[0]?.id,
          muxAssetId: asset.id,
          duration,
        })
        .where(
          and(eq(videos.id, input.videoId), eq(videos.userId, ctx.user.id))
        );
    }),
  getAllVideos: publicProcedure
    .input(
      z.object({
        pagesize: z.number().default(DEFAULT_PAGINATION_LIMIT),
        cursor: z.number().int().nullish(),
        categoryId: z.string().cuid2().nullish(),
      })
    )
    .query(async ({ input }) => {
      const { pagesize, cursor, categoryId } = input;
      const offset = cursor ?? 0;
      const result = await db
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
        })
        .from(videos)
        .where(
          and(
            categoryId ? eq(videos.categoryId, categoryId) : undefined,
            eq(videos.visibility, "PUBLIC")
          )
        )
        .innerJoin(users, eq(videos.userId, users.id))
        .limit(pagesize + 1)
        .offset(offset)
        .orderBy(desc(videos.createdAt));

      const nextCursor = result.length > pagesize ? pagesize + offset : null;

      const data = {
        videos: result.slice(0, pagesize),
        nextCursor,
      };

      return data;
    }),
  getTrending: publicProcedure
    .input(
      z.object({
        pagesize: z.number().default(DEFAULT_PAGINATION_LIMIT),
        cursor: z.number().int().nullish(),
      })
    )
    .query(async ({ input }) => {
      const { pagesize, cursor } = input;
      const offset = cursor ?? 0;
      const viewCountSubQuery = db.$count(
        videoViews,
        eq(videoViews.videoId, videos.id)
      );

      const result = await db
        .select({
          ...getTableColumns(videos),
          viewCount: viewCountSubQuery,
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
        })
        .from(videos)
        .where(eq(videos.visibility, "PUBLIC"))
        .innerJoin(users, eq(videos.userId, users.id))
        .limit(pagesize + 1)
        .offset(offset)
        .orderBy(desc(viewCountSubQuery));

      const nextCursor = result.length > pagesize ? pagesize + offset : null;

      const data = {
        videos: result.slice(0, pagesize),
        nextCursor,
      };

      return data;
    }),
  getVideosFromSubscriptions: protectedProcedure
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

      const viewerSubscriptions = db.$with("viewer_subscriptions").as(
        db
          .select({
            creatorId: subscriptions.creatorId,
            viewerId: subscriptions.viewerId,
          })
          .from(subscriptions)
          .where(eq(subscriptions.viewerId, userId))
      );

      const result = await db
        .with(viewerSubscriptions)
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
        })
        .from(videos)
        .where(
          and(
            eq(videos.visibility, "PUBLIC"),
            eq(viewerSubscriptions.viewerId, userId)
          )
        )
        .innerJoin(users, eq(videos.userId, users.id))
        .innerJoin(
          viewerSubscriptions,
          eq(viewerSubscriptions.creatorId, users.id)
        )
        .limit(pagesize + 1)
        .offset(offset)
        .orderBy(desc(videos.createdAt));

      const nextCursor = result.length > pagesize ? pagesize + offset : null;

      const data = {
        videos: result.slice(0, pagesize),
        nextCursor,
      };

      return data;
    }),
});
