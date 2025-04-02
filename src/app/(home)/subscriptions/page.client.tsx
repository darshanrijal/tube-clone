"use client";

import { trpc } from "@/__rpc/react";
import { InfiniteScroll } from "@/components/infinite-scroll";
import Link from "next/link";
import { toast } from "sonner";
import { SubscriptionItem } from "./subscription-item";

export const SubscriptionClientPage = () => {
  const utils = trpc.useUtils();
  const [data, query] = trpc.subscription.getMany.useSuspenseInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const unsubscribe = trpc.subscription.subscribe_unsubscribe.useMutation({
    onError: (error) => toast.error(error.message),
    onSuccess: (data) => {
      utils.videos.getVideosFromSubscriptions.invalidate();
      utils.users.get.invalidate({ userId: data.creatorId });
      utils.subscription.getMany.invalidate();
    },
  });
  const subscriptions = data.pages.flatMap((page) => page.subscriptions);

  return (
    <div>
      <div className="flex flex-col gap-4">
        {subscriptions.map((subscription) => (
          <Link
            href={`/users/${subscription.user.id}`}
            key={subscription.creatorId}
          >
            <SubscriptionItem
              name={subscription.user.name}
              imageUrl={subscription.user.imageUrl}
              subscriberCount={subscription.user.subscribersCount}
              onUnsubscribe={() => {
                unsubscribe.mutate({ creatorId: subscription.creatorId });
              }}
              disabled={unsubscribe.isPending}
            />
          </Link>
        ))}
      </div>
      <InfiniteScroll hideLabel {...query} />
    </div>
  );
};
