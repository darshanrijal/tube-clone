import { db } from "@/db";
import { commentReactionTable, reactionEnum } from "@/db/schema";
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
        .from(commentReactionTable)
        .where(
          and(
            eq(commentReactionTable.commentId, commentId),
            eq(commentReactionTable.userId, user.id)
          )
        );

      if (existingReaction) {
        if (existingReaction.type === type) {
          await db
            .delete(commentReactionTable)
            .where(
              and(
                eq(commentReactionTable.commentId, commentId),
                eq(commentReactionTable.userId, user.id)
              )
            );
        } else {
          await db
            .update(commentReactionTable)
            .set({ type })
            .where(
              and(
                eq(commentReactionTable.commentId, commentId),
                eq(commentReactionTable.userId, user.id)
              )
            );
        }
      } else {
        await db.insert(commentReactionTable).values({
          userId: user.id,
          commentId,
          type,
        });
      }
    }),
});
