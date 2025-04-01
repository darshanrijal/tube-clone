"use client";
import { AlertTriangle } from "lucide-react";
import type { FallbackProps } from "react-error-boundary";
import { Button } from "./ui/button";

// TODO: Add title to suspense fallbacks
export const ErrorFallback = ({
  error,
  resetErrorBoundary,
  title,
}: FallbackProps & { title?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <AlertTriangle className="size-10 text-red-500" />
      <h3 className="font-semibold text-lg">
        {title ?? "Something went wrong"}
      </h3>
      <p className="text-muted-foreground text-sm">{error.message}</p>
      <Button type="button" onClick={() => resetErrorBoundary()}>
        Reload
      </Button>
    </div>
  );
};
