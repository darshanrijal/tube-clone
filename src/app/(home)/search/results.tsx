"use client";

import { trpc } from "@/__rpc/react";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { VideoGridCard } from "@/components/video/video-grid-card";
import { VideoRowCard } from "@/components/video/video-row-card";

interface SearchResultsProps {
  query: string | undefined;
  categoryId: string | undefined;
}
export const SearchResults = ({ categoryId, query }: SearchResultsProps) => {
  const [data, q] = trpc.search.getAllVideos.useSuspenseInfiniteQuery(
    { categoryId, query },
    {
      getNextPageParam: (lastpage) => lastpage.nextCursor,
    }
  );

  const videos = data.pages.flatMap((page) => page.videos);
  return (
    <>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {videos.map((video) => (
          <VideoGridCard key={video.id} data={video} />
        ))}
      </div>
      <div className="hidden flex-col gap-4 md:flex">
        {videos.map((video) => (
          <VideoRowCard key={video.id} data={video} />
        ))}
      </div>
      <InfiniteScroll hideLabel {...q} />
    </>
  );
};
