import { HydrateClient, api } from "@/__rpc/server";
import { SuspenseFallbackError } from "@/components/suspense-fallback-error";
import { PlaylistGridCardSkelton } from "./_components/playlist-grid-card";
import { PlaylistView } from "./playlist-view";

export default function Playlists() {
  api.playlists.getMany.prefetchInfinite({});
  return (
    <HydrateClient>
      <SuspenseFallbackError
        fallback={
          <div className="mt-10 grid 3xl:grid-cols-5 4xl:grid-cols-6 grid-cols-1 gap-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <PlaylistGridCardSkelton key={i} />
            ))}
          </div>
        }
      >
        <PlaylistView />
      </SuspenseFallbackError>
    </HydrateClient>
  );
}
