import { trpc } from "@/__rpc/react";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

interface UseSubscriptionParams {
  userId: string;
  isSubscribed: boolean;
  fromVideoId?: string;
}

export function useSubscription({
  isSubscribed,
  userId,
  fromVideoId,
}: UseSubscriptionParams) {
  const clerk = useClerk();
  const utils = trpc.useUtils();

  const subscribe = trpc.subscription.subscribe_unsubscribe.useMutation({
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      if (isSubscribed) {
        toast.success("Unsubscribed");
      } else {
        toast.success("Subscribded");
      }

      if (fromVideoId) {
        utils.videos.getVideo.invalidate({ videoId: fromVideoId });
      }
      utils.videos.getVideosFromSubscriptions.invalidate();
    },
  });

  const onClick = () => {
    if (!clerk.isSignedIn) {
      return clerk.openSignIn();
    }
    subscribe.mutate({ creatorId: userId });
  };

  return {
    onClick,
    isPending: subscribe.isPending,
  };
}
