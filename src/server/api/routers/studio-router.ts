import { DEFAULT_PAGINATION_LIMIT } from "@/constants";
import { db } from "@/db";
import { videoTable } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const studioRouter = router({
  getAllVideos: protectedProcedure
    .input(
      z.object({
        pagesize: z.number().default(DEFAULT_PAGINATION_LIMIT),
        cursor: z.number().int().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { pagesize, cursor } = input;
      const offset = cursor ?? 0;
      const result = await db
        .select()
        .from(videoTable)
        .where(eq(videoTable.userId, userId))
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

  getVideo: protectedProcedure
    .input(z.object({ videoId: z.string().cuid2() }))
    .query(async ({ input, ctx }) => {
      const { videoId } = input;
      const userId = ctx.user.id;

      const [video] = await db
        .select()
        .from(videoTable)
        .where(and(eq(videoTable.userId, userId), eq(videoTable.id, videoId)));

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }

      return video;
    }),
});
