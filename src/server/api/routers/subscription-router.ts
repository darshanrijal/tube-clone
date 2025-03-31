import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const subscriptionRouter = router({
  subscribe_unsubscribe: protectedProcedure
    .input(
      z.object({
        creatorId: z.string().cuid2(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { creatorId } = input;

      const [existingSubscription] = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.creatorId, creatorId),
            eq(subscriptions.viewerId, user.id)
          )
        );

      if (existingSubscription) {
        await db
          .delete(subscriptions)
          .where(
            and(
              eq(subscriptions.creatorId, creatorId),
              eq(subscriptions.viewerId, user.id)
            )
          );
      } else {
        await db.insert(subscriptions).values({
          creatorId,
          viewerId: user.id,
        });
      }
    }),
});
