import { HydrateClient, api } from "@/__rpc/server";
import { SuspenseFallbackError } from "@/components/suspense-fallback-error";
import { SubscriptionClientPage } from "./page.client";
import { SubscriptionItemSkeleton } from "./subscription-item";

export default function Subscriptions() {
  api.subscription.getMany.prefetchInfinite({});
  return (
    <HydrateClient>
      <div className="mx-auto mb-10 flex max-w-screen-lg flex-col gap-y-6 px-4 pt-2.5">
        <div>
          <h1 className="font-bold text-2xl">All subscriptions</h1>
          <p className="text-muted-foreground text-xs">
            View and manage all your subscriptions
          </p>
        </div>
        <SuspenseFallbackError
          fallback={
            <div className="flex flex-col gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <SubscriptionItemSkeleton key={i} />
              ))}
            </div>
          }
        >
          <SubscriptionClientPage />
        </SuspenseFallbackError>
      </div>
    </HydrateClient>
  );
}
