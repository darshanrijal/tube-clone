import { db } from "@/db";
import { commentReactions, reactionEnum } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const commentReactionsRouter = router({
  react: protectedProcedure
    .input(
      z.object({
        commentId: z.string().cuid2(),
        type: z.enum(reactionEnum),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { commentId, type } = input;

      const [existingReaction] = await db
        .select()
        .from(commentReactions)
        .where(
          and(
            eq(commentReactions.commentId, commentId),
            eq(commentReactions.userId, user.id)
          )
        );

      if (existingReaction) {
        if (existingReaction.type === type) {
          await db
            .delete(commentReactions)
            .where(
              and(
                eq(commentReactions.commentId, commentId),
                eq(commentReactions.userId, user.id)
              )
            );
        } else {
          await db
            .update(commentReactions)
            .set({ type })
            .where(
              and(
                eq(commentReactions.commentId, commentId),
                eq(commentReactions.userId, user.id)
              )
            );
        }
      } else {
        await db.insert(commentReactions).values({
          userId: user.id,
          commentId,
          type,
        });
      }
    }),
});
