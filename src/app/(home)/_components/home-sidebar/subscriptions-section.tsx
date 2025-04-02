"use client";

import { trpc } from "@/__rpc/react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserAvatar } from "@/components/user-avatar";
import { AlertTriangle, ListIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const SubscriptionSection = () => {
  const { data, isPending, error, isLoading } =
    trpc.subscription.getMany.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastpage) => lastpage.nextCursor,
      }
    );
  const pathname = usePathname();
  const subscriptions = data?.pages.flatMap((page) => page.subscriptions);
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Subscriptions</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {subscriptions?.map((subscription) => (
            <SidebarMenuItem
              key={`${subscription.creatorId}_${subscription.viewerId}`}
            >
              <SidebarMenuButton
                tooltip={subscription.user.name}
                isActive={pathname === `/users/${subscription.user.id}`}
                asChild
              >
                <Link
                  href={`/users/${subscription.user.id}`}
                  className="flex items-center gap-4"
                >
                  <UserAvatar
                    imageUrl={subscription.user.imageUrl}
                    name={subscription.user.name}
                    size="xs"
                  />
                  <span className="text-sm">{subscription.user.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          {isPending && (
            <Loader2 className="mx-auto size-4 animate-spin text-muted-foreground" />
          )}

          {error && (
            <div className="mx-auto">
              <AlertTriangle className="size-5" />
              <p className="sr-only">{error.message}</p>
            </div>
          )}

          {!isLoading && (
            <SidebarMenuButton asChild isActive={pathname === "/subscriptions"}>
              <Link href="/subscriptions" className="flex items-center gap-4">
                <ListIcon className="size-4" />
                <span className="text-sm">All subscriptions</span>
              </Link>
            </SidebarMenuButton>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
