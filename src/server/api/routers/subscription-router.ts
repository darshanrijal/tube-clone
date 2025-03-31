import { db } from "@/db";
import { subscriptionTable } from "@/db/schema";
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
        .from(subscriptionTable)
        .where(
          and(
            eq(subscriptionTable.creatorId, creatorId),
            eq(subscriptionTable.viewerId, user.id)
          )
        );

      if (existingSubscription) {
        await db
          .delete(subscriptionTable)
          .where(
            and(
              eq(subscriptionTable.creatorId, creatorId),
              eq(subscriptionTable.viewerId, user.id)
            )
          );
      } else {
        await db.insert(subscriptionTable).values({
          creatorId,
          viewerId: user.id,
        });
      }
    }),
});
