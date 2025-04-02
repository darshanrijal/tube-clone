import { HydrateClient, api } from "@/__rpc/server";
import { SuspenseFallbackError } from "@/components/suspense-fallback-error";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoGridCardSkeleton } from "@/components/video/video-grid-card";
import { VideoRowCardSkeleton } from "@/components/video/video-row-card";
import { PlaylistHeader } from "./playlist-header";
import { PlaylistVideos } from "./playlist-videos";

export default async function PlaylistIdPage({
  params,
}: { params: Promise<{ playlistId: string }> }) {
  const { playlistId } = await params;
  api.playlists.getVideos.prefetchInfinite({ playlistId });
  api.playlists.getOne.prefetch({ playlistId });
  return (
    <HydrateClient>
      <div className="mx-auto mb-10 flex max-w-screen-lg flex-col gap-y-6 px-4 pt-2.5">
        <SuspenseFallbackError
          fallback={
            <div className="flex flex-col gap-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          }
        >
          <PlaylistHeader playlistId={playlistId} />
        </SuspenseFallbackError>

        <SuspenseFallbackError
          fallback={
            <div>
              <div className="flex flex-col gap-4 gap-y-10 md:hidden">
                {Array.from({ length: 10 }).map((_, i) => (
                  <VideoGridCardSkeleton key={i} />
                ))}
              </div>
              <div className="hidden flex-col gap-4 md:flex">
                {Array.from({ length: 10 }).map((_, i) => (
                  <VideoRowCardSkeleton size="compact" key={i} />
                ))}
              </div>
            </div>
          }
        >
          <PlaylistVideos playlistId={playlistId} />
        </SuspenseFallbackError>
      </div>
    </HydrateClient>
  );
}
