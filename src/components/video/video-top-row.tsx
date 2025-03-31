import type { VideoData } from "@/types";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "../ui/skeleton";
import { VideoDescription } from "./video-description";
import { VideoMenu } from "./video-menu";
import { VideoOwner } from "./video-owner";
import { VideoReactions } from "./video-reactions";

interface VideoTopRowProps {
  video: VideoData;
}

export const VideoTopRowSkeleton = () => {
  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-4/5 md:w-2/5" />
      </div>

      <div className="flex w-full items-center justify-between">
        <div className="flex w-[70%] items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex w-full flex-col gap-2">
            <Skeleton className="h-5 w-4/5 md:w-2/6" />
            <Skeleton className="h-5 w-3/5 md:w-1/5" />
          </div>
        </div>
        <Skeleton className="h-9 w-2/6 rounded-full md:w-1/6" />
      </div>
      <div className="h-30 w-full" />
    </div>
  );
};

export const VideoTopRow = ({ video }: VideoTopRowProps) => {
  const compactViews = Intl.NumberFormat("en", { notation: "compact" }).format(
    video.views
  );
  const expandedViews = Intl.NumberFormat("en", {
    notation: "standard",
  }).format(video.views);

  const compactDate = formatDistanceToNow(video.createdAt, { addSuffix: true });
  const expandedDate = format(video.createdAt, "PPP");
  return (
    <div className="mt-4 flex flex-col gap-4">
      <h1 className="font-semibold text-xl">{video.title}</h1>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <VideoOwner user={video.user} videoId={video.id} />
        <div className="-mb-2 flex gap-2 overflow-x-auto pb-2 sm:mb-0 sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible sm:pb-0">
          <VideoReactions
            videoId={video.id}
            likes={video.likes}
            dislikes={video.dislikes}
            viewerReaction={video.reaction}
          />
          <VideoMenu videoId={video.id} variant="secondary" />
        </div>
      </div>
      <VideoDescription
        description={video.description}
        compactViews={compactViews}
        expandedViews={expandedViews}
        compactDate={compactDate}
        expandedDate={expandedDate}
      />
    </div>
  );
};
