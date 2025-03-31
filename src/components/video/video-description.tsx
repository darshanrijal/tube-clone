"use client";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

interface VideoDescriptionProps {
  description: string | null;
  compactViews: string;
  expandedViews: string;
  compactDate: string;
  expandedDate: string;
}

export const VideoDescription = ({
  description,
  compactDate,
  compactViews,
  expandedDate,
  expandedViews,
}: VideoDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl bg-secondary/50 p-3 opacity-70 transition hover:bg-secondary">
      <div className="mb-2 flex gap-2 text-sm">
        <span className="font-medium">
          {isExpanded ? expandedViews : compactViews} views
        </span>
        <span className="font-medium">
          {isExpanded ? expandedDate : compactDate}
        </span>
      </div>

      <div>
        <p
          className={cn(
            "whitespace-pre-wrap text-sm",
            !isExpanded && "line-clamp-2"
          )}
        >
          {description || "No description"}
        </p>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 h-auto p-0 font-medium text-sm"
        >
          <span className="flex items-center gap-1">
            {isExpanded ? (
              <>
                Show less <ChevronUp className="size-4" />
              </>
            ) : (
              <>
                Show more <ChevronDown className="size-4" />
              </>
            )}
          </span>
        </Button>
      </div>
    </div>
  );
};
