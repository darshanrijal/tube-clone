"use client";
import { trpc } from "@/__rpc/react";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { VideoGridCard } from "@/components/video/video-grid-card";

interface HomeVideosProps {
  categoryId: string | undefined;
}
export const HomeVideos = ({ categoryId }: HomeVideosProps) => {
  const [data, query] = trpc.videos.getAllVideos.useSuspenseInfiniteQuery(
    { categoryId },
    {
      getNextPageParam: (lastpage) => lastpage.nextCursor,
    }
  );

  const videos = data.pages.flatMap((page) => page.videos);
  return (
    <div>
      <div className="grid 3xl:grid-cols-5 4xl:grid-cols-6 grid-cols-1 gap-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
        {videos.map((video) => (
          <VideoGridCard key={video.id} data={video} />
        ))}
      </div>
      <InfiniteScroll hideLabel {...query} />
    </div>
  );
};
