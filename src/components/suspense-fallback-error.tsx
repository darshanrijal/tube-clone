import { type Key, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./error-fallback";

interface SuspenseFallbackErrorProps {
  children: React.ReactNode;
  fallback: React.ComponentProps<typeof Suspense>["fallback"];
  key?: Key | null;
}

export const SuspenseFallbackError = ({
  children,
  fallback: SuspenseFallback,
  key,
}: SuspenseFallbackErrorProps) => {
  return (
    <Suspense key={key} fallback={SuspenseFallback}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {children}
      </ErrorBoundary>
    </Suspense>
  );
};
