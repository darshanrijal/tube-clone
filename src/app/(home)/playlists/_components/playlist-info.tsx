import { Skeleton } from "@/components/ui/skeleton";
import type { PlaylistData } from "@/types";

interface PlaylistInfoProps {
  data: PlaylistData[number];
}

export const PlaylistInfo = ({ data }: PlaylistInfoProps) => {
  return (
    <div className="flex gap-3">
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-1 break-words font-medium text-sm lg:line-clamp-2">
          {data.name}
        </h3>

        <p className="text-muted-foreground text-sm">Playlist</p>
        <p className="font-semibold text-muted-foreground text-sm hover:text-primary">
          View full playlist
        </p>
      </div>
    </div>
  );
};

export const PlaylistInfoSkeleton = () => {
  return (
    <div className="flex gap-3">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-[90%] " />
        <Skeleton className="h-5 w-[70%] " />
        <Skeleton className="h-5 w-[50%] " />
      </div>
    </div>
  );
};
