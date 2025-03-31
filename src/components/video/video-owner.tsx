import { useSubscription } from "@/hooks/use-subscription";
import type { VideoData } from "@/types";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { SubscriptionButton } from "../subscription-button";
import { Button } from "../ui/button";
import { UserAvatar } from "../user-avatar";
import { UserInfo } from "./user-info";

interface VideoOwnerProps {
  user: VideoData["user"];
  videoId: string;
}
export const VideoOwner = ({ user, videoId }: VideoOwnerProps) => {
  const { userId: clerkId } = useAuth();
  const { isPending, onClick } = useSubscription({
    userId: user.id,
    isSubscribed: user.isSubscribed,
    fromVideoId: videoId,
  });
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 sm:items-start sm:justify-start">
      <Link href={`/users/${user.id}`}>
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar imageUrl={user.imageUrl} name={user.name} size="lg" />
          <div className="flex min-w-0 flex-col gap-1">
            <UserInfo size="lg" name={user.name} />
            <span className="line-clamp-1 text-muted-foreground text-sm">
              {user.subscribers} subscribers
            </span>
          </div>
        </div>
      </Link>

      {clerkId === user.clerkId ? (
        <Button className="rounded-full" variant="secondary" asChild>
          <Link href={`/studio/videos/${videoId}`}>Edit video</Link>
        </Button>
      ) : (
        <SubscriptionButton
          onClick={onClick}
          disabled={isPending}
          isSubscribed={user.isSubscribed}
          className="flex-none"
        />
      )}
    </div>
  );
};
