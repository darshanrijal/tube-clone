import { cn } from "@/lib/utils";
import type { VideoGetManyOutput } from "@/types";
import { type VariantProps, cva } from "class-variance-authority";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { UserAvatar } from "../user-avatar";
import { UserInfo } from "./user-info";
import { VideoMenu } from "./video-menu";
import { VideoThumbnail, VideoThumbnailSkeleton } from "./video-thumbnail";

const videoRowCardVariants = cva("group flex min-w-0", {
  variants: {
    size: {
      default: "gap-4",
      compact: "gap-2",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const thumbnailVariants = cva("relative flex-none", {
  variants: {
    size: {
      default: "w-[38%]",
      compact: "w-[168px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

type VideoRowCardProps = VariantProps<typeof videoRowCardVariants> &
  VariantProps<typeof thumbnailVariants> & {
    data: VideoGetManyOutput["videos"][number];
    onRemove?: VoidFunction;
  };

export const VideoRowCardSkeleton = ({
  size = "default",
}: Pick<VideoRowCardProps, "size">) => {
  return (
    <div className={videoRowCardVariants({ size })}>
      <div className={thumbnailVariants({ size })}>
        <VideoThumbnailSkeleton />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-x-2">
          <div className="min-w-0 flex-1">
            <Skeleton
              className={cn("h-5 w-[40%]", size === "compact" && "h-4")}
            />
            {size === "default" && (
              <>
                <Skeleton className="mt-1 h-4 w-[20%]" />
                <div className="my-3 flex items-center gap-2">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-4 w-2/4" />
                </div>
              </>
            )}

            {size === "compact" && <Skeleton className="mt-1" />}
          </div>
        </div>
      </div>
    </div>
  );
};

export const VideoRowCard = ({
  data,
  onRemove,
  size = "default",
}: VideoRowCardProps) => {
  const compactViews = Intl.NumberFormat("en", { notation: "compact" }).format(
    data.viewCount
  );
  const compactLikes = Intl.NumberFormat("en", { notation: "compact" }).format(
    data.likeCount
  );
  return (
    <div className={videoRowCardVariants({ size })}>
      <Link href={`/videos/${data.id}`} className={thumbnailVariants({ size })}>
        <VideoThumbnail
          imageUrl={data.thumbnailUrl}
          previewUrl={data.previewUrl}
          title={data.title}
          duration={data.duration}
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-x-2">
          <Link href={`/videos/${data.id}`} className="min-w-0 flex-1">
            <h3
              className={cn(
                "line-clamp-2 font-medium",
                size === "compact" ? "text-sm" : "text-base"
              )}
            >
              {data.title}
            </h3>

            {size === "default" && (
              <>
                <p className="mt-1 text-muted-foreground text-xs">
                  {compactViews} views • {compactLikes} likes
                </p>
                <div className="my-3 flex items-center gap-2">
                  <UserAvatar
                    size="sm"
                    imageUrl={data.user.imageUrl}
                    name={data.user.name}
                  />
                  <UserInfo size="sm" name={data.user.name} />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="line-clamp-2 w-fit text-muted-foreground text-xs">
                      {data.description}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="center"
                    className="bg-black/70"
                  >
                    <p>From the video description</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            {size === "compact" && (
              <>
                <UserInfo size="sm" name={data.user.name} />
                <p className="mt-1 text-muted-foreground text-xs">
                  {compactViews} views • {compactLikes} likes
                </p>
              </>
            )}
          </Link>

          <div className="flex-none">
            <VideoMenu videoId={data.id} onRemove={onRemove} />
          </div>
        </div>
      </div>
    </div>
  );
};
