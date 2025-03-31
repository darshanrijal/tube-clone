import { HydrateClient, api } from "@/__rpc/server";
import { FilterCarousel } from "@/components/filter-carousel";
import { SuspenseFallbackError } from "@/components/suspense-fallback-error";
import { VideoGridCardSkeleton } from "@/components/video/video-grid-card";
import { VideoRowCardSkeleton } from "@/components/video/video-row-card";
import { SearchClientPage } from "./page.client";
import { SearchResults } from "./results";

export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    categoryId?: string;
  }>;
}) {
  const { categoryId, query } = await searchParams;

  api.categories.get.prefetch();
  api.search.getAllVideos.prefetchInfinite({ query, categoryId });

  return (
    <HydrateClient>
      <div className="mx-auto mb-10 flex max-w-[1300px] flex-col gap-y-6 px-4 pt-2.5">
        <SuspenseFallbackError
          fallback={<FilterCarousel isLoading data={[]} />}
        >
          <SearchClientPage categoryId={categoryId} />
        </SuspenseFallbackError>
        {(query !== undefined || categoryId !== undefined) && (
          <SuspenseFallbackError
            fallback={
              <div>
                <div className="hidden flex-col gap-4 md:flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <VideoRowCardSkeleton key={i} />
                  ))}
                </div>
                <div className="flex flex-col gap-4 gap-y-10 p-4 pt-6 md:hidden">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <VideoGridCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            }
          >
            <SearchResults categoryId={categoryId} query={query} />
          </SuspenseFallbackError>
        )}
      </div>
    </HydrateClient>
  );
}
