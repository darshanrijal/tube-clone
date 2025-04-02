import { DEFAULT_PAGINATION_LIMIT } from "@/constants";
import { db } from "@/db";
import {
  subscriptionTable,
  userTable,
  videoReactionTable,
  videoTable,
  videoViewTable,
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
      .insert(videoTable)
      .values({
        title: "UNTITLED",
        userId,
        muxStatus: "waiting",
        muxUploadId: upload.id,
      })
      .returning({ id: videoTable.id });

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
        .update(videoTable)
        .set(values)
        .where(and(eq(videoTable.userId, userId), eq(videoTable.id, videoId)))
        .returning({ id: videoTable.id });

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
        .delete(videoTable)
        .where(and(eq(videoTable.userId, userId), eq(videoTable.id, videoId)))
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
        .from(videoTable)
        .where(
          and(eq(videoTable.userId, userId), eq(videoTable.id, input.videoId))
        );

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
        .update(videoTable)
        .set({
          thumbnailUrl: data.ufsUrl,
          thumbnailKey: data.key,
        })
        .where(eq(videoTable.id, video.id));
    }),
  getVideo: publicProcedure
    .input(z.object({ videoId: z.string().cuid2() }))
    .query(async ({ input, ctx }) => {
      const { videoId } = input;

      const { clerkId } = ctx;

      let userId: string | undefined;

      const [user] = await db
        .select({ id: userTable.id })
        .from(userTable)
        .where(inArray(userTable.clerkId, clerkId ? [clerkId] : []));

      if (user) {
        userId = user.id;
      }

      const viewerReaction = db.$with("viewer_reactions").as(
        db
          .select({
            videoId: videoReactionTable.videoId,
            type: videoReactionTable.type,
          })
          .from(videoReactionTable)
          .where(inArray(videoReactionTable.userId, userId ? [userId] : []))
      );
      const viewerSubscriptions = db.$with("viewer_subscriptions").as(
        db
          .select()
          .from(subscriptionTable)
          .where(inArray(subscriptionTable.viewerId, userId ? [userId] : []))
      );
      const [video] = await db
        .with(viewerReaction, viewerSubscriptions)
        .select({
          ...getTableColumns(videoTable),
          user: {
            id: userTable.id,
            clerkId: userTable.clerkId,
            name: userTable.name,
            imageUrl: userTable.imageUrl,
            isSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(
              Boolean
            ),
            subscribers: db.$count(
              subscriptionTable,
              eq(subscriptionTable.creatorId, userTable.id)
            ),
          },
          views: db.$count(
            videoViewTable,
            eq(videoViewTable.videoId, videoTable.id)
          ),
          likes: db.$count(
            videoReactionTable,
            and(
              eq(videoReactionTable.videoId, videoTable.id),
              eq(videoReactionTable.type, "like")
            )
          ),
          dislikes: db.$count(
            videoReactionTable,
            and(
              eq(videoReactionTable.videoId, videoTable.id),
              eq(videoReactionTable.type, "dislike")
            )
          ),
          reaction: viewerReaction.type,
        })
        .from(videoTable)
        .where(eq(videoTable.id, videoId))
        .innerJoin(userTable, eq(videoTable.userId, userTable.id))
        .leftJoin(viewerReaction, eq(viewerReaction.videoId, videoTable.id))
        .leftJoin(
          viewerSubscriptions,
          eq(viewerSubscriptions.creatorId, userTable.id)
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
        .from(videoTable)
        .where(eq(videoTable.id, input.videoId));

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
        .update(videoTable)
        .set({
          muxStatus: asset.status,
          muxPlaybackId: asset.playback_ids?.[0]?.id,
          muxAssetId: asset.id,
          duration,
        })
        .where(
          and(
            eq(videoTable.id, input.videoId),
            eq(videoTable.userId, ctx.user.id)
          )
        );
    }),
  getAllVideos: publicProcedure
    .input(
      z.object({
        pagesize: z.number().default(DEFAULT_PAGINATION_LIMIT),
        cursor: z.number().int().nullish(),
        categoryId: z.string().cuid2().nullish(),
        userId: z.string().cuid2().nullish(),
      })
    )
    .query(async ({ input }) => {
      const { pagesize, cursor, categoryId, userId } = input;
      const offset = cursor ?? 0;
      const result = await db
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
        .where(
          and(
            eq(videoTable.visibility, "PUBLIC"),
            categoryId ? eq(videoTable.categoryId, categoryId) : undefined,
            userId ? eq(videoTable.userId, userId) : undefined
          )
        )
        .innerJoin(userTable, eq(videoTable.userId, userTable.id))
        .limit(pagesize + 1)
        .offset(offset)
        .orderBy(desc(videoTable.createdAt));

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
        videoViewTable,
        eq(videoViewTable.videoId, videoTable.id)
      );

      const result = await db
        .select({
          ...getTableColumns(videoTable),
          viewCount: viewCountSubQuery,
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
            creatorId: subscriptionTable.creatorId,
            viewerId: subscriptionTable.viewerId,
          })
          .from(subscriptionTable)
          .where(eq(subscriptionTable.viewerId, userId))
      );

      const result = await db
        .with(viewerSubscriptions)
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
        .where(
          and(
            eq(videoTable.visibility, "PUBLIC"),
            eq(viewerSubscriptions.viewerId, userId)
          )
        )
        .innerJoin(userTable, eq(videoTable.userId, userTable.id))
        .innerJoin(
          viewerSubscriptions,
          eq(viewerSubscriptions.creatorId, userTable.id)
        )
        .limit(pagesize + 1)
        .offset(offset)
        .orderBy(desc(videoTable.createdAt));

      const nextCursor = result.length > pagesize ? pagesize + offset : null;

      const data = {
        videos: result.slice(0, pagesize),
        nextCursor,
      };

      return data;
    }),
});
