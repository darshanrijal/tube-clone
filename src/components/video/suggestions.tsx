"use client";
import { trpc } from "@/__rpc/react";
import { InfiniteScroll } from "../infinite-scroll";
import { VideoGridCard, VideoGridCardSkeleton } from "./video-grid-card";
import { VideoRowCard, VideoRowCardSkeleton } from "./video-row-card";

interface SuggestionsProps {
  videoId: string;
  isManual?: boolean;
}
export const Suggestions = ({ videoId, isManual }: SuggestionsProps) => {
  const [suggestions, query] = trpc.suggestions.get.useSuspenseInfiniteQuery(
    { videoId },
    {
      getNextPageParam: (lp) => lp.nextCursor,
    }
  );

  const videos = suggestions.pages.flatMap((page) => page.videos);
  return (
    <>
      <div className="hidden space-y-3 md:block">
        {videos.map((video) => (
          <VideoRowCard size="compact" key={video.id} data={video} />
        ))}
      </div>

      <div className="block space-y-10 md:hidden">
        {videos.map((video) => (
          <VideoGridCard key={video.id} data={video} />
        ))}
      </div>

      <InfiniteScroll hideLabel isManual={isManual} {...query} />
    </>
  );
};

export const SuggestionsSkeleton = () => {
  return (
    <>
      <div className="hidden space-y-3 md:block">
        {Array.from({ length: 8 }).map((_, i) => (
          <VideoRowCardSkeleton key={i} size="compact" />
        ))}
      </div>

      <div className="block space-y-10 md:hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <VideoGridCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
};
