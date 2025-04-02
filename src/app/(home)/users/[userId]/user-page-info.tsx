import { SubscriptionButton } from "@/components/subscription-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { useSubscription } from "@/hooks/use-subscription";
import { cn } from "@/lib/utils";
import type { UserData } from "@/types";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";

interface UserPageInfoProps {
  user: UserData;
}
export const UserPageInfo = ({ user }: UserPageInfoProps) => {
  const clerk = useClerk();
  const { isPending, onClick } = useSubscription({
    isSubscribed: user.isSubscribed,
    userId: user.id,
  });
  return (
    <div className="py-6">
      <div className="flex flex-col md:hidden">
        <div className="flex items-center gap-3">
          <UserAvatar
            size="lg"
            imageUrl={user.imageUrl}
            name={user.name}
            className="size-15"
            onClick={() => {
              if (user.clerkId === clerk.user?.id) {
                clerk.openUserProfile();
              }
            }}
          />

          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-xl">{user.name}</h1>
            <div className="mt-1 flex items-center gap-1 text-muted-foreground text-xs">
              <span>{user.subscriberCount} subscribers</span>•
              <span>{user.videoCount} videos</span>
            </div>
          </div>
        </div>

        {clerk.user?.id === user.clerkId ? (
          <Button
            variant="secondary"
            className="mt-3 w-full rounded-full"
            asChild
          >
            <Link href="/studio">Go to Studio</Link>
          </Button>
        ) : (
          <SubscriptionButton
            disabled={isPending}
            isSubscribed={user.isSubscribed}
            onClick={onClick}
            className="mt-3 w-full"
          />
        )}
      </div>

      <div className="hidden items-start gap-4 md:flex">
        <UserAvatar
          size="xl"
          imageUrl={user.imageUrl}
          name={user.name}
          className={cn(
            clerk.user?.id === user.clerkId &&
              "cursor-pointer transition-opacity duration-300 hover:opacity-80"
          )}
          onClick={() => {
            if (user.clerkId === clerk.user?.id) {
              clerk.openUserProfile();
            }
          }}
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-bold text-4xl">{user.name}</h1>
          <div className="mt-3 flex items-center gap-1 text-muted-foreground text-sm">
            <span>{user.subscriberCount} subscribers</span>•
            <span>{user.videoCount} videos</span>
          </div>
          {clerk.user?.id === user.clerkId ? (
            <Button variant="secondary" className="mt-3 rounded-full" asChild>
              <Link href="/studio">Go to Studio</Link>
            </Button>
          ) : (
            <SubscriptionButton
              disabled={isPending}
              isSubscribed={user.isSubscribed}
              onClick={onClick}
              className="mt-3"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const UserPageInfoSkeleton = () => {
  return (
    <div className="py-6">
      <div className="flex flex-col md:hidden">
        <div className="flex items-center gap-3">
          <Skeleton className="size-15 rounded-full" />

          <div className="min-w-0 flex-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-1 h-4 w-48" />
          </div>
        </div>

        <Skeleton className="mt-3 h-10 w-full rounded-full" />
      </div>

      <div className="hidden items-start gap-4 md:flex">
        <Skeleton className="size-40 rounded-full" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-4 h-5 w-48" />
          <Skeleton className="mt-3 h-10 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
};
