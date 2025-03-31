"use client";

import { trpc } from "@/__rpc/react";
import {
  FilterCarousel,
  type FilterCarouselData,
} from "@/components/filter-carousel";

interface HomeClientPageProps {
  categoryId: string | undefined;
}
export const SearchClientPage = ({ categoryId }: HomeClientPageProps) => {
  const [categories] = trpc.categories.get.useSuspenseQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });

  const data: FilterCarouselData = categories.map((c) => ({
    label: c.name,
    value: c.id,
  }));
  return <FilterCarousel data={data} value={categoryId} />;
};
