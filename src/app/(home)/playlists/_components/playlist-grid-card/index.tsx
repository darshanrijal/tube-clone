import type { PlaylistData } from "@/types";
import Link from "next/link";
import { PlaylistInfo, PlaylistInfoSkeleton } from "../playlist-info";
import {
  PlaylistThumbnail,
  PlaylistThumbnailSkeleton,
} from "./playlist-thumbnail";

interface PlaylistGridCardProps {
  data: PlaylistData[number];
}

export const PlaylistGridCardSkelton = () => {
  return (
    <div className="group flex w-full flex-col gap-2">
      <PlaylistThumbnailSkeleton />
      <PlaylistInfoSkeleton />
    </div>
  );
};

export const PlaylistGridCard = ({ data }: PlaylistGridCardProps) => {
  return (
    <Link href={`/playlists/${data.id}`}>
      <div className="group flex w-full flex-col gap-2">
        <PlaylistThumbnail
          imageUrl={data.latestVideoThumbnail}
          title={data.name}
          videoCount={data.videoCount}
        />

        <PlaylistInfo data={data} />
      </div>
    </Link>
  );
};
