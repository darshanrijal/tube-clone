"use client";

import { trpc } from "@/__rpc/react";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { VideoGridCard } from "@/components/video/video-grid-card";
import { VideoRowCard } from "@/components/video/video-row-card";
import { toast } from "sonner";

interface PlaylistVideosProps {
  playlistId: string;
}
export const PlaylistVideos = ({ playlistId }: PlaylistVideosProps) => {
  const [data, query] = trpc.playlists.getVideos.useSuspenseInfiniteQuery(
    { playlistId },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  const utils = trpc.useUtils();

  const removeVideo = trpc.playlists.removeVideo.useMutation({
    onSuccess: (data) => {
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideo.invalidate({ videoId: data.videoId });
      utils.playlists.getOne.invalidate({ playlistId: data.playlistId });
      utils.playlists.getVideos.invalidate({ playlistId: data.playlistId });
      toast.success("Video removed from playlist");
    },
    onError: (error) => toast.warning(error.message),
  });
  const videos = data.pages.flatMap((page) => page.videos);

  return (
    <div>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {videos.map((video) => (
          <VideoGridCard
            key={video.id}
            data={video}
            onRemove={() =>
              removeVideo.mutate({ playlistId, videoId: video.id })
            }
          />
        ))}
      </div>
      <div className="hidden flex-col gap-4 md:flex">
        {videos.map((video) => (
          <VideoRowCard
            key={video.id}
            data={video}
            size="compact"
            onRemove={() =>
              removeVideo.mutate({ playlistId, videoId: video.id })
            }
          />
        ))}
      </div>
      <InfiniteScroll hideLabel {...query} />
    </div>
  );
};
