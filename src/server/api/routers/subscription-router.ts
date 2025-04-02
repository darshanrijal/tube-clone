import { DEFAULT_PAGINATION_LIMIT } from "@/constants";
import { db } from "@/db";
import { subscriptionTable, userTable } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns } from "drizzle-orm";
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
        const [deletedSubscription] = await db
          .delete(subscriptionTable)
          .where(
            and(
              eq(subscriptionTable.creatorId, creatorId),
              eq(subscriptionTable.viewerId, user.id)
            )
          )
          .returning();

        if (!deletedSubscription) {
          throw new TRPCError({ code: "BAD_REQUEST" });
        }

        return deletedSubscription;
      }
      const [createdSubscription] = await db
        .insert(subscriptionTable)
        .values({
          creatorId,
          viewerId: user.id,
        })
        .returning();

      if (!createdSubscription) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      return createdSubscription;
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        pagesize: z.number().default(DEFAULT_PAGINATION_LIMIT),
        cursor: z.number().int().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const { pagesize, cursor } = input;
      const offset = cursor ?? 0;
      const result = await db
        .select({
          ...getTableColumns(subscriptionTable),
          user: {
            id: userTable.id,
            name: userTable.name,
            imageUrl: userTable.imageUrl,
            subscribersCount: db.$count(
              subscriptionTable,
              eq(subscriptionTable.creatorId, userTable.id)
            ),
          },
        })
        .from(subscriptionTable)
        .where(eq(subscriptionTable.viewerId, userId))
        .innerJoin(userTable, eq(subscriptionTable.creatorId, userTable.id))
        .limit(pagesize + 1)
        .offset(offset)
        .orderBy(desc(subscriptionTable.createdAt));

      const nextCursor = result.length > pagesize ? pagesize + offset : null;

      const data = {
        subscriptions: result.slice(0, pagesize),
        nextCursor,
      };

      return data;
    }),
});
