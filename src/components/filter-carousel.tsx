"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Badge } from "./ui/badge";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Skeleton } from "./ui/skeleton";

interface FilterCarouselProps {
  value?: string | null;
  isLoading?: boolean;
  data: FilterCarouselData;
}

export type FilterCarouselData = {
  value: string;
  label: string;
}[];

export const FilterCarousel = ({
  data,
  isLoading,
  value,
}: FilterCarouselProps) => {
  const searchParams = useSearchParams();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const carouselRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || !api) {
      return;
    }

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > 0) {
        e.preventDefault();

        if (e.deltaX > 0) {
          api.scrollNext(); // Scroll right-to-left
        } else {
          api.scrollPrev(); // Scroll left-to-right
        }
      }
    };

    carousel.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      carousel.removeEventListener("wheel", handleWheel);
    };
  }, [api]);

  // Function to create URL with updated query params
  const createUrl = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams);

    if (categoryId) {
      params.set("categoryId", categoryId);
    } else {
      params.delete("categoryId");
    }

    return `/search?${params.toString()}`;
  };

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "pointer-events-none absolute top-0 bottom-0 left-12 z-10 w-12 bg-gradient-to-r from-white to-transparent",
          current === 1 && "hidden"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute top-0 right-12 bottom-0 z-10 w-12 bg-gradient-to-l from-white to-transparent",
          current === count && "hidden"
        )}
      />
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full px-12"
        setApi={setApi}
      >
        <CarouselContent className="-ml-3" ref={carouselRef}>
          {!isLoading && (
            <CarouselItem className="basis-auto pl-3">
              <Link href={createUrl(null)} scroll={false}>
                <Badge
                  variant={value ? "secondary" : "default"}
                  className="cursor-pointer whitespace-nowrap rounded-lg px-3 py-1 text-sm"
                >
                  All
                </Badge>
              </Link>
            </CarouselItem>
          )}
          {isLoading &&
            Array.from({ length: 14 }).map((_, index) => (
              <CarouselItem key={index} className="basis-auto pl-3">
                <Skeleton className="h-full w-25 rounded-lg px-3 py-1 font-semibold text-sm">
                  &nbsp;
                </Skeleton>
              </CarouselItem>
            ))}
          {!isLoading &&
            data.map((item) => (
              <CarouselItem key={item.value} className="basis-auto pl-3">
                <Link href={createUrl(item.value)} scroll={false}>
                  <Badge
                    variant={value === item.value ? "default" : "secondary"}
                    className="cursor-pointer whitespace-nowrap rounded-lg px-3 py-1 text-sm"
                  >
                    {item.label}
                  </Badge>
                </Link>
              </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 z-20" />
        <CarouselNext className="right-0 z-20" />
      </Carousel>
    </div>
  );
};
