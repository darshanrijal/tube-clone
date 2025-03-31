import { HydrateClient, api } from "@/__rpc/server";
import { SuspenseFallbackError } from "@/components/suspense-fallback-error";
import { VideoGridCardSkeleton } from "@/components/video/video-grid-card";
import { TrendingVideosClientPage } from "./page.client";

export const dynamic = "force-dynamic";
export default function Trending() {
  api.videos.getTrending.prefetchInfinite({});
  return (
    <HydrateClient>
      <div className="mx-auto mb-10 flex max-w-600 flex-col gap-y-6 px-4 pt-2.5">
        <div>
          <h1 className="font-bold text-2xl">Trending</h1>
          <p className="text-muted-foreground text-xs">
            Most popular videos at the moment
          </p>
        </div>
        <SuspenseFallbackError
          fallback={
            <div className="grid 3xl:grid-cols-5 4xl:grid-cols-6 grid-cols-1 gap-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 18 }).map((_, i) => (
                <VideoGridCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <TrendingVideosClientPage />
        </SuspenseFallbackError>
      </div>
    </HydrateClient>
  );
}
