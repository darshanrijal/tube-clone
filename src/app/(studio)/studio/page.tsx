import { HydrateClient, api } from "@/__rpc/server";
import { SuspenseFallbackError } from "@/components/suspense-fallback-error";
import { StudioClientPage, VideoTableSkeleton } from "./page.client";

export const dynamic = "force-dynamic";
export default function Studio() {
  api.studio.getAllVideos.prefetchInfinite({});
  return (
    <HydrateClient>
      <div className="flex flex-col gap-y-6 pt-2.5">
        <div className="px-4">
          <h1 className="font-bold text-2xl">Channel Content</h1>
          <p className="text-muted-foreground text-xs">
            Manage your channel content and videos
          </p>
        </div>

        <SuspenseFallbackError fallback={<VideoTableSkeleton />}>
          <StudioClientPage />
        </SuspenseFallbackError>
      </div>
    </HydrateClient>
  );
}
