import { HydrateClient, api } from "@/__rpc/server";
import { SuspenseFallbackError } from "@/components/suspense-fallback-error";
import { Separator } from "@/components/ui/separator";
import { VideoGridCardSkeleton } from "@/components/video/video-grid-card";
import { UserPageBannerSkeleton } from "./user-page-banner";
import { UserPageInfoSkeleton } from "./user-page-info";
import { UserSection } from "./user-section";
import { UserVideos } from "./user-videos";

export default async function UserPage({
  params,
}: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  api.users.get.prefetch({ userId });
  api.videos.getAllVideos.prefetchInfinite({ userId });
  return (
    <HydrateClient>
      <div className="mx-auto mb-10 flex max-w-[1300px] flex-col gap-y-6 px-4 pt-2">
        <SuspenseFallbackError
          fallback={
            <div className="flex flex-col">
              <UserPageBannerSkeleton />
              <UserPageInfoSkeleton />
              <Separator />
            </div>
          }
        >
          <UserSection userId={userId} />
        </SuspenseFallbackError>

        <SuspenseFallbackError
          fallback={
            <div className="grid grid-cols-1 gap-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 18 }).map((_, i) => (
                <VideoGridCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <UserVideos userId={userId} />
        </SuspenseFallbackError>
      </div>
    </HydrateClient>
  );
}
