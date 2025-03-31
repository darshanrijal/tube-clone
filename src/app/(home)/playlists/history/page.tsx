import { HydrateClient, api } from "@/__rpc/server";
import { SuspenseFallbackError } from "@/components/suspense-fallback-error";
import { VideoGridCardSkeleton } from "@/components/video/video-grid-card";
import { VideoRowCardSkeleton } from "@/components/video/video-row-card";
import { HistoryClientPage } from "./page.client";

export const dynamic = "force-dynamic";

export default function HistoryPage() {
  api.playlists.getHistory.prefetchInfinite({});

  return (
    <HydrateClient>
      <div className="mx-auto mb-10 flex max-w-screen-md flex-col gap-y-6 px-4 pt-2.5">
        <div>
          <h1 className="font-bold text-2xl">History</h1>
          <p className="text-muted-foreground text-xs">
            Videos you have watched
          </p>
        </div>
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
          <HistoryClientPage />
        </SuspenseFallbackError>
      </div>
    </HydrateClient>
  );
}
