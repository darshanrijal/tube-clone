import { db } from "@/db";
import { subscriptionTable, userTable, videoTable } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { eq, getTableColumns, inArray, isNotNull } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const userRouter = router({
  get: publicProcedure
    .input(z.object({ userId: z.string().cuid2() }))
    .query(async ({ ctx, input }) => {
      const clerkId = ctx.clerkId;
      let myId: string | undefined;
      const [me] = await db
        .select()
        .from(userTable)
        .where(inArray(userTable.clerkId, clerkId ? [clerkId] : []));

      if (me) {
        myId = me.id;
      }

      const mySubscriptions = db.$with("my_subscriptions").as(
        db
          .select()
          .from(subscriptionTable)
          .where(inArray(subscriptionTable.viewerId, myId ? [myId] : []))
      );

      const [user] = await db
        .with(mySubscriptions)
        .select({
          ...getTableColumns(userTable),
          isSubscribed: isNotNull(mySubscriptions.viewerId).mapWith(Boolean),
          videoCount: db.$count(
            videoTable,
            eq(videoTable.userId, userTable.id)
          ),
          subscriberCount: db.$count(
            subscriptionTable,
            eq(subscriptionTable.creatorId, userTable.id)
          ),
        })
        .from(userTable)
        .where(eq(userTable.id, input.userId))
        .leftJoin(mySubscriptions, eq(mySubscriptions.creatorId, userTable.id));

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return user;
    }),
});
