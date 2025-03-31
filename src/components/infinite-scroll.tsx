import type React from "react";

import { useIntersectionObserver } from "@/hooks/use-observer";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Button } from "./ui/button";

interface InfiniteScrollProps {
  isManual?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  hideLabel?: boolean;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  isManual,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  hideLabel,
}) => {
  const [targetRef, isIntersecting] = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage && !isManual) {
      fetchNextPage();
    }
  }, [
    isIntersecting,
    hasNextPage,
    isFetchingNextPage,
    isManual,
    fetchNextPage,
  ]);

  return (
    <div className="flex w-full flex-col items-center py-8">
      <div className="h-1" ref={targetRef} />

      {hasNextPage && (
        <div className="flex flex-col items-center gap-2">
          {isFetchingNextPage ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">
                Loading more items...
              </p>
            </div>
          ) : (
            isManual && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => fetchNextPage()}
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>Load more</span>
                </span>
                <span className="absolute inset-0 origin-left scale-x-0 transform bg-primary/10 transition-transform duration-300 group-hover:scale-x-100" />
              </Button>
            )
          )}
        </div>
      )}
      {!hideLabel && (
        <div className="mt-4 mb-2 flex flex-col items-center gap-2 rounded-lg bg-muted/30 px-6 py-4">
          <CheckCircle2 className="h-5 w-5 text-primary/70" />
          <p className="text-center font-medium text-sm">
            You've reached the end
          </p>
        </div>
      )}
    </div>
  );
};
