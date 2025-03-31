import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ListVideoIcon, PlayIcon } from "lucide-react";
import Image from "next/image";

interface PlaylistThumbnailProps {
  imageUrl: string | null;
  title: string;
  videoCount: number;
  className?: string;
}

export const PlaylistThumbnail = ({
  imageUrl,
  title,
  videoCount,
  className,
}: PlaylistThumbnailProps) => {
  const compactVideoCount = Intl.NumberFormat("en").format(videoCount);
  return (
    <div className={cn("group/thumbnail relative pt-3", className)}>
      <div className="relative">
        <div className="-top-3 -translate-x-1/2 absolute left-1/2 aspect-video w-[97%] overflow-hidden rounded-xl bg-black/20" />
        <div className="-top-1.5 -translate-x-1/2 absolute left-1/2 aspect-video w-[98.5%] overflow-hidden rounded-xl bg-black/25" />

        <div className="relative aspect-video w-full overflow-hidden rounded-xl">
          <Image
            src={imageUrl ?? "/placeholder.svg"}
            alt={`Playlist cover image of ${title}`}
            className="size-full object-cover"
            fill
          />

          <div className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 transition-opacity group-hover/thumbnail:opacity-100">
            <div className="flex items-center gap-x-2">
              <PlayIcon className="size-4 fill-white text-white" />
              <span className="font-medium text-white">Play all</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute right-2 bottom-2 flex items-center gap-x-1 rounded-sm bg-black/80 px-1 py-0.5 font-medium text-white text-xs">
        <ListVideoIcon className="size-4" />
        {compactVideoCount} videos
      </div>
    </div>
  );
};

export const PlaylistThumbnailSkeleton = () => {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl">
      <Skeleton className="size-full" />
    </div>
  );
};
