import { DEFAULT_PAGINATION_LIMIT } from "@/constants";
import { db } from "@/db";
import { users, videoReactions, videoViews, videos } from "@/db/schema";
import { and, desc, eq, getTableColumns, ilike } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const searchRouter = router({
  getAllVideos: publicProcedure
    .input(
      z.object({
        pagesize: z.number().default(DEFAULT_PAGINATION_LIMIT),
        cursor: z.number().int().nullish(),
        query: z.string().nonempty().nullish(),
        categoryId: z.string().cuid2().nullish(),
      })
    )
    .query(async ({ input }) => {
      const { pagesize, cursor, categoryId, query } = input;
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
            query ? ilike(videos.title, `%${query}`) : undefined,
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
});
