import { db } from "@/db";
import { reactionEnum, videoReactions } from "@/db/schema";
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
        .from(videoReactions)
        .where(
          and(
            eq(videoReactions.videoId, videoId),
            eq(videoReactions.userId, user.id)
          )
        );

      if (existingReaction) {
        if (existingReaction.type === type) {
          await db
            .delete(videoReactions)
            .where(
              and(
                eq(videoReactions.userId, user.id),
                eq(videoReactions.videoId, videoId)
              )
            );
        } else {
          await db
            .update(videoReactions)
            .set({ type })
            .where(
              and(
                eq(videoReactions.userId, user.id),
                eq(videoReactions.videoId, videoId)
              )
            );
        }
      } else {
        await db.insert(videoReactions).values({
          userId: user.id,
          videoId,
          type,
        });
      }
    }),
});
