"use client";
import { trpc } from "@/__rpc/react";
import { Separator } from "@/components/ui/separator";
import { UserPageBanner } from "./user-page-banner";
import { UserPageInfo } from "./user-page-info";

interface UserSectionProps {
  userId: string;
}

export const UserSection = ({ userId }: UserSectionProps) => {
  const [user] = trpc.users.get.useSuspenseQuery({ userId });

  return (
    <div className="flex flex-col">
      <UserPageBanner user={user} />
      <UserPageInfo user={user} />
      <Separator />
    </div>
  );
};
