import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { UserData } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { Edit2 } from "lucide-react";

interface UserPageBannerProps {
  user: UserData;
}
export const UserPageBanner = ({ user }: UserPageBannerProps) => {
  const { userId: clerkId } = useAuth();
  return (
    <div className="group relative">
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
