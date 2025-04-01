import { trpc } from "@/__rpc/react";
import type { Fn } from "@/types";
import { Loader2, SquareCheck, SquareIcon } from "lucide-react";
import { toast } from "sonner";
import { ErrorFallback } from "../error-fallback";
import { InfiniteScroll } from "../infinite-scroll";
import { ResponsiveModal } from "../responsive-modal";
import { Button } from "../ui/button";

interface PlaylistAddMoadlProps {
  open: boolean;
  onOpenChange: Fn<boolean, void>;
  videoId: string;
}

export function PlaylistAddModal({
  onOpenChange,
  open,
  videoId,
}: PlaylistAddMoadlProps) {
  const utils = trpc.useUtils();
  const addVideo = trpc.playlists.addVideo.useMutation({
    onSuccess: () => {
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideo.invalidate({ videoId });
      toast.success("Video added to playlist");
    },
    onError: (error) => toast.warning(error.message),
  });
  const removeVideo = trpc.playlists.removeVideo.useMutation({
    onSuccess: () => {
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideo.invalidate({ videoId });
      toast.success("Video removed from playlist");
    },
    onError: (error) => toast.warning(error.message),
  });
  const { data, isLoading, error, refetch, ...query } =
    trpc.playlists.getManyForVideo.useInfiniteQuery(
      { videoId },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: !!videoId && open,
      }
    );

  const playlists = data?.pages.flatMap((page) => page.playlists) ?? [];
  return (
    <ResponsiveModal
      title="Add to playlist"
      open={open}
      onOpenChange={onOpenChange}
    >
      {error && (
        <ErrorFallback
          error={error}
          resetErrorBoundary={() => refetch({ throwOnError: true })}
        />
      )}
      {isLoading && (
        <div className="flex justify-center p-4">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}
      <div className="flex flex-col gap-2">
        {playlists.map((playlist) => (
          <Button
            variant="ghost"
            className="w-full justify-start px-2"
            size="lg"
            key={playlist.id}
            onClick={() => {
              if (playlist.containsVideo) {
                removeVideo.mutate({ playlistId: playlist.id, videoId });
              } else {
                addVideo.mutate({ playlistId: playlist.id, videoId });
              }
            }}
            disabled={removeVideo.isPending || addVideo.isPending}
          >
            {playlist.containsVideo ? (
              <SquareCheck className="mr-2" />
            ) : (
              <SquareIcon className="mr-2" />
            )}
            {playlist.name}
          </Button>
        ))}

        {!isLoading && <InfiniteScroll isManual {...query} />}
      </div>
    </ResponsiveModal>
  );
}
