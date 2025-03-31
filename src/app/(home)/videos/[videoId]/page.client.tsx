"use client";

import { trpc } from "@/__rpc/react";
import VideoBanner from "@/components/video/video-banner";
import { VideoPlayer } from "@/components/video/video-player";
import { VideoTopRow } from "@/components/video/video-top-row";
import { cn } from "@/lib/utils";

interface VideoClientPageProps {
  videoId: string;
}
export default function VideoClientPage({ videoId }: VideoClientPageProps) {
  const [video] = trpc.videos.getVideo.useSuspenseQuery({ videoId });
  const utils = trpc.useUtils();
  const createView = trpc.views.create.useMutation({
    onSuccess: () => utils.videos.getVideo.invalidate({ videoId }),
  });
  const handlePlay = () => {
    createView.mutate({ videoId });
  };
  return (
    <>
      <div
        className={cn(
          "relative aspect-video overflow-hidden rounded-xl bg-black",
          video.muxStatus !== "ready" && "rounded-b-none"
        )}
      >
        <VideoPlayer
          autoPlay={true}
          onPlay={handlePlay}
          playbackId={video.muxPlaybackId}
          imageUrl={video.thumbnailUrl}
        />
      </div>

      <VideoBanner status={video.muxStatus} />
      <VideoTopRow video={video} />
    </>
  );
}
