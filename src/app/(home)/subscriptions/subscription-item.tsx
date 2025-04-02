import { SubscriptionButton } from "@/components/subscription-button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";

interface SubscriptionItemProps {
  name: string;
  imageUrl: string;
  subscriberCount: number;
  onUnsubscribe: VoidFunction;
  disabled: boolean;
}

export const SubscriptionItem = ({
  disabled,
  imageUrl,
  name,
  onUnsubscribe,
  subscriberCount,
}: SubscriptionItemProps) => {
  return (
    <div className="flex items-start gap-4">
      <UserAvatar size="lg" imageUrl={imageUrl} name={name} />

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm">{name}</h3>
            <p className="text-muted-foreground text-xs">
              {subscriberCount.toLocaleString()} subscribers
            </p>
          </div>

          <SubscriptionButton
            disabled={disabled}
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onUnsubscribe();
            }}
            isSubscribed
          />
        </div>
      </div>
    </div>
  );
};

export const SubscriptionItemSkeleton = () => {
  return (
    <div className="flex items-start gap-4">
      <Skeleton className="size-10 rounded-full" />

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-1 h-3 w-20" />
          </div>

          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
};
