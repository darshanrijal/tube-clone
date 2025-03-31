import { DEFAULT_PAGINATION_LIMIT } from "@/constants";
import { db } from "@/db";
import {
  userTable,
  videoReactionTable,
  videoTable,
  videoViewTable,
} from "@/db/schema";
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
            query ? ilike(videoTable.title, `%${query}`) : undefined,
            categoryId ? eq(videoTable.categoryId, categoryId) : undefined,
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
