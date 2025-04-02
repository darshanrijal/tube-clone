"use client";
import { trpc } from "@/__rpc/react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PlaylistHeaderProps {
  playlistId: string;
}

export const PlaylistHeader = ({ playlistId }: PlaylistHeaderProps) => {
  const [playlist] = trpc.playlists.getOne.useSuspenseQuery({ playlistId });
  const utils = trpc.useUtils();
  const router = useRouter();
  const remove = trpc.playlists.remove.useMutation({
    onSuccess: () => {
      utils.playlists.getMany.invalidate();
      toast.success("Playlist removed");
      router.push("/playlists");
    },
    onError: (error) => toast.warning(error.message),
  });
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-bold text-2xl">{playlist.name}</h1>
        <p className="text-muted-foreground text-xs">
          Videos from the playlist
        </p>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        onClick={() => remove.mutate({ playlistId })}
        disabled={remove.isPending}
      >
        <Trash2 />
      </Button>
    </div>
  );
};
