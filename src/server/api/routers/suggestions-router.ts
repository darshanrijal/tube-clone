import { DEFAULT_PAGINATION_LIMIT } from "@/constants";
import { db } from "@/db";
import {
  userTable,
  videoReactionTable,
  videoTable,
  videoViewTable,
} from "@/db/schema";
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
        .from(videoTable)
        .where(eq(videoTable.id, videoId));

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }

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
            existingVideo.categoryId
              ? eq(videoTable.categoryId, existingVideo.categoryId)
              : undefined,
            not(eq(videoTable.id, existingVideo.id)),
            eq(videoTable.visibility, "PUBLIC")
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
});
