import { trpc } from "@/__rpc/react";
import type { ReactionType } from "@/db/schema";
import { cn } from "@/lib/utils";
import { useClerk } from "@clerk/nextjs";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

interface VideoReactionProps {
  videoId: string;
  likes: number;
  dislikes: number;
  viewerReaction: ReactionType | null;
}

export const VideoReactions = ({
  videoId,
  dislikes,
  likes,
  viewerReaction,
}: VideoReactionProps) => {
  const clerk = useClerk();

  const utils = trpc.useUtils();
  const react = trpc.reaction.react.useMutation({
    onError: (error) => toast.warning(error.message),
    onSuccess: () => {
      utils.videos.getVideo.invalidate({ videoId });
      utils.playlists.getLiked.invalidate();
    },
  });

  function handleReaction(type: ReactionType) {
    if (!clerk.isSignedIn) {
      clerk.openSignIn();
      return;
    }

    react.mutate({ videoId, type });
  }

  return (
    <div className="flex flex-none items-center">
      <Button
        variant="secondary"
        className="gap-2 rounded-r-none rounded-l-full pr-4"
        onClick={() => handleReaction("like")}
        disabled={react.isPending}
      >
        <ThumbsUp
          className={cn("size-5", viewerReaction === "like" && "fill-black")}
        />
        {likes}
      </Button>
      <Separator orientation="vertical" className="h-7" />
      <Button
        variant="secondary"
        className="gap-2 rounded-r-full rounded-l-none pl-3"
        onClick={() => handleReaction("dislike")}
        disabled={react.isPending}
      >
        <ThumbsDown
          className={cn("size-5", viewerReaction === "dislike" && "fill-black")}
        />
        {dislikes}
      </Button>
    </div>
  );
};
