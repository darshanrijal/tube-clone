import { HydrateClient, api } from "@/__rpc/server";
import { SuspenseFallbackError } from "@/components/suspense-fallback-error";
import { Comments } from "@/components/video/comments";
import { Suggestions } from "@/components/video/suggestions";
import { VideoPlayerSkeleton } from "@/components/video/video-player";
import { VideoTopRowSkeleton } from "@/components/video/video-top-row";
import { Loader2 } from "lucide-react";
import VideoClientPage from "./page.client";

export default async function VideoPage({
  params,
}: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  api.videos.getVideo.prefetch({ videoId });
  api.comments.get.prefetchInfinite({ videoId });
  api.suggestions.get.prefetchInfinite({ videoId });
  return (
    <HydrateClient>
      <div className="mx-auto mb-10 flex max-w-[1700px] flex-col p-2.5 px-4">
        <div className="flex flex-col gap-6 xl:flex-row">
          <div className="min-w-0 flex-1">
            <SuspenseFallbackError
              fallback={
                <>
                  <VideoPlayerSkeleton />
                  <VideoTopRowSkeleton />
                </>
              }
            >
              <VideoClientPage videoId={videoId} />
            </SuspenseFallbackError>
            <div className="mt-4 block xl:hidden">
              <SuspenseFallbackError fallback={<p>Loading</p>}>
                <Suggestions videoId={videoId} isManual />
              </SuspenseFallbackError>
            </div>

            <SuspenseFallbackError
              fallback={<Loader2 className="mx-auto size-7 animate-spin" />}
            >
              <Comments videoId={videoId} />
            </SuspenseFallbackError>
          </div>
          <div className="hidden w-full shrink xl:block xl:w-[380px] 2xl:w-[460px]">
            <SuspenseFallbackError fallback={<p>Loading</p>}>
              <Suggestions videoId={videoId} />
            </SuspenseFallbackError>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
