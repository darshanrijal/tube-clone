import { db } from "@/db";
import { getUserByClerkId } from "@/db/queries";
import { videos } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { type FileRouter, createUploadthing } from "uploadthing/next";
import { UTApi, UploadThingError } from "uploadthing/server";
import { z } from "zod";

const f = createUploadthing();

export const ourFileRouter = {
  thumbnailUploder: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(z.object({ videoId: z.string() }))
    .middleware(async ({ input }) => {
      const { userId: clerkId } = await auth();

      if (!clerkId) {
        throw new UploadThingError("Unauthorized");
      }

      const user = await getUserByClerkId(clerkId);

      const [video] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)));

      if (!video) {
        throw new UploadThingError("No video found");
      }

      const { thumbnailKey } = video;

      if (thumbnailKey) {
        await new UTApi().deleteFiles([thumbnailKey]);
      }

      return { user, video };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      await db
        .update(videos)
        .set({ thumbnailUrl: file.ufsUrl })
        .where(eq(videos.id, metadata.video.id));
      return { fileUrl: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
