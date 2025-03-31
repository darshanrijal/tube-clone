"use client";
import { trpc } from "@/__rpc/react";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CreatePlaylistModal } from "./_components/playlist-create-modal";
import { PlaylistGridCard } from "./_components/playlist-grid-card";

export function PlaylistView() {
  const [data, query] = trpc.playlists.getMany.useSuspenseInfiniteQuery(
    {},
    {
      getNextPageParam: (lastpage) => lastpage.nextCursor,
    }
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const playlists = data.pages.flatMap((page) => page.playlists);
  return (
    <div className="mx-auto mb-10 flex max-w-600 flex-col gap-y-6 px-4 pt-2.5">
      <CreatePlaylistModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">Playlists</h1>
          <p className="text-muted-foreground text-xs">
            Collections you have created
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => setCreateModalOpen(true)}
        >
          <Plus />
        </Button>
      </div>

      <div className="grid 3xl:grid-cols-5 4xl:grid-cols-6 grid-cols-1 gap-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
        {playlists.map((playlist) => (
          <PlaylistGridCard key={playlist.id} data={playlist} />
        ))}
      </div>
      <InfiniteScroll hideLabel {...query} />
    </div>
  );
}
