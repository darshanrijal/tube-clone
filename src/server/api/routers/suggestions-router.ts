import { DEFAULT_PAGINATION_LIMIT } from "@/constants";
import { db } from "@/db";
import { users, videoReactions, videoViews, videos } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, not } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const suggestionRouter = router({
  get: publicProcedure
    .input(
      z.object({
        pagesize: z.number().default(DEFAULT_PAGINATION_LIMIT),
        cursor: z.number().int().nullish(),
        videoId: z.string().cuid2(),
      })
    )
    .query(async ({ input }) => {
      const { pagesize, videoId, cursor } = input;

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId));

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }

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
            existingVideo.categoryId
              ? eq(videos.categoryId, existingVideo.categoryId)
              : undefined,
            not(eq(videos.id, existingVideo.id)),
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
});
