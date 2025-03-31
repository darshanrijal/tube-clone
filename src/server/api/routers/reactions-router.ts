import { db } from "@/db";
import { reactionEnum, videoReactionTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const reactionRouter = router({
  react: protectedProcedure
    .input(
      z.object({
        videoId: z.string().cuid2(),
        type: z.enum(reactionEnum),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { videoId, type } = input;

      const [existingReaction] = await db
        .select()
        .from(videoReactionTable)
        .where(
          and(
            eq(videoReactionTable.videoId, videoId),
            eq(videoReactionTable.userId, user.id)
          )
        );

      if (existingReaction) {
        if (existingReaction.type === type) {
          await db
            .delete(videoReactionTable)
            .where(
              and(
                eq(videoReactionTable.userId, user.id),
                eq(videoReactionTable.videoId, videoId)
              )
            );
        } else {
          await db
            .update(videoReactionTable)
            .set({ type })
            .where(
              and(
                eq(videoReactionTable.userId, user.id),
                eq(videoReactionTable.videoId, videoId)
              )
            );
        }
      } else {
        await db.insert(videoReactionTable).values({
          userId: user.id,
          videoId,
          type,
        });
      }
    }),
});
