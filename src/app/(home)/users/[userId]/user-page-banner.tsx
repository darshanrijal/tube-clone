"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { UserData } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { Edit2 } from "lucide-react";
import { useState } from "react";
import { BannerUploadModal } from "./banner-upload-modal";

interface UserPageBannerProps {
  user: UserData;
}
export const UserPageBanner = ({ user }: UserPageBannerProps) => {
  const { userId: clerkId } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <div className="group relative">
      <BannerUploadModal open={open} onOpenChange={setOpen} userId={user.id} />
      <div
        className={cn(
          "h-[15vh] max-h-50 w-full rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 md:h-[25vh]",
          user.bannerKey ? "bg-center bg-cover" : "bg-gray-100"
        )}
        style={{
          backgroundImage: user.bannerKey
            ? `url(${user.bannerUrl})`
            : undefined,
        }}
      >
        {user.clerkId === clerkId && (
          <Button
            onClick={() => setOpen(true)}
            type="button"
            size="icon"
            className="absolute top-4 right-4 rounded-full bg-black/50 opacity-100 transition-opacity duration-300 hover:bg-black/50 group-hover:opacity-100 md:opacity-0"
          >
            <Edit2 className="size-4 text-white" />
          </Button>
        )}
      </div>
    </div>
  );
};

export const UserPageBannerSkeleton = () => {
  return <Skeleton className="h-[15vh] max-h-50 w-full md:h-[25vh]" />;
};
