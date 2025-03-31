import { HydrateClient, api } from "@/__rpc/server";
import { FilterCarousel } from "@/components/filter-carousel";
import { SuspenseFallbackError } from "@/components/suspense-fallback-error";
import { VideoGridCardSkeleton } from "@/components/video/video-grid-card";
import { HomeVideos } from "./home-videos";
import { HomeClientPage } from "./page.client";
export default async function Home({
  searchParams,
}: { searchParams: Promise<{ categoryId?: string }> }) {
  const { categoryId } = await searchParams;

  api.categories.get.prefetch();
  api.videos.getAllVideos.prefetchInfinite({ categoryId });
  return (
    <HydrateClient>
      <div className="mx-auto mb-10 flex max-w-600 flex-col gap-y-6 px-4 pt-2.5">
        <SuspenseFallbackError
          fallback={<FilterCarousel isLoading data={[]} />}
        >
          <HomeClientPage categoryId={categoryId} />
        </SuspenseFallbackError>
        {/* Home videos */}
        <SuspenseFallbackError
          key={categoryId}
          fallback={
            <div className="grid 3xl:grid-cols-5 4xl:grid-cols-6 grid-cols-1 gap-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 18 }).map((_, i) => (
                <VideoGridCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <div>
            <HomeVideos categoryId={categoryId} />
          </div>
        </SuspenseFallbackError>
      </div>
    </HydrateClient>
  );
}
