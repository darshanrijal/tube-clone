"use client";

import { trpc } from "@/__rpc/react";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Button } from "@/components/ui/button";
import { VideoGridCard } from "@/components/video/video-grid-card";
import { UserPlus } from "lucide-react";
import Link from "next/link";

export const SubscriptionsVideoClientPage = () => {
  const [data, query] =
    trpc.videos.getVideosFromSubscriptions.useSuspenseInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const videos = data.pages.flatMap((page) => page.videos);

  return (
    <div>
      <div className="grid 3xl:grid-cols-5 4xl:grid-cols-6 grid-cols-1 gap-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
        {videos.map((video) => (
          <VideoGridCard key={video.id} data={video} />
        ))}

        {videos.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <UserPlus className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="mb-2 font-semibold text-xl">
              No subscription videos
            </h3>
            <p className="mb-6 max-w-md text-muted-foreground">
              Subscribe to creators to view their videos here
            </p>
            <Button asChild>
              <Link href="/">Discover creators</Link>
            </Button>
          </div>
        )}
      </div>
      <InfiniteScroll hideLabel {...query} />
    </div>
  );
};
