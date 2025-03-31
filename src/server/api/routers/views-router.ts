import { db } from "@/db";
import { getUserByClerkId } from "@/db/queries";
import { videoViews } from "@/db/schema";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const viewsRouter = router({
  create: publicProcedure
    .input(z.object({ videoId: z.string().cuid2() }))
    .mutation(async ({ ctx, input }) => {
      const { clerkId } = ctx;

      if (!clerkId) {
        return;
      }
      const user = await getUserByClerkId(clerkId);

      const { videoId } = input;

      await db
        .insert(videoViews)
        .values({
          userId: user.id,
          videoId,
        })
        .onConflictDoNothing();
    }),
});
