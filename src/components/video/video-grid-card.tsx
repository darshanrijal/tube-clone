import type { VideoGetManyOutput } from "@/types";
import Link from "next/link";
import { VideoInfo, VideoInfoSkeleton } from "./video-info";
import { VideoThumbnail, VideoThumbnailSkeleton } from "./video-thumbnail";

interface VideoGridCardProps {
  data: VideoGetManyOutput["videos"][number];
  onRemove?: VoidFunction;
}
export const VideoGridCard = (props: VideoGridCardProps) => {
  const { data } = props;
  return (
    <div className="group flex w-full flex-col gap-2">
      <Link href={`/videos/${data.id}`}>
        <VideoThumbnail
          imageUrl={data.thumbnailUrl}
          previewUrl={data.previewUrl}
          title={data.title}
          duration={data.duration}
        />
      </Link>
      <VideoInfo {...props} />
    </div>
  );
};

export const VideoGridCardSkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-2">
      <VideoThumbnailSkeleton />
      <VideoInfoSkeleton />
    </div>
  );
};
