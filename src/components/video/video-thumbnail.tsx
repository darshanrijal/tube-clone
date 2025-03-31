import { formatDuration } from "@/lib/utils";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";

interface VideoThumbnailProps {
  imageUrl: string | null;
  previewUrl: string | null;
  title: string;
  duration: number;
}
export const VideoThumbnail = ({
  imageUrl,
  title,
  previewUrl,
  duration,
}: VideoThumbnailProps) => {
  return (
    <div className="relative">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl">
        <Image
          src={imageUrl ?? "/placeholder.svg"}
          alt={`thumbnail for video ${title}`}
          className="size-full object-cover hover:opacity-0"
          fill
        />
        <Image
          src={previewUrl ?? "/placeholder.svg"}
          alt={`preview for video ${title}`}
          unoptimized={!!previewUrl}
          className="size-full object-cover opacity-0 hover:opacity-100"
          fill
        />
      </div>

      <div className="absolute right-2 bottom-2 rounded-sm bg-black/80 px-1 py-0.5 font-medium text-white text-xs">
        {formatDuration(duration)}
      </div>
    </div>
  );
};

export const VideoThumbnailSkeleton = () => {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl">
      <Skeleton className="size-full" />
    </div>
  );
};
