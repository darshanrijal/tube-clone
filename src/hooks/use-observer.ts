import { useEffect, useRef, useState } from "react";

/**
 * A React hook that uses the Intersection Observer API to track when an element
 * is visible in the viewport.
 *
 * @param {Object} options - Intersection Observer options
 * @param {number} [options.threshold=0] - A number or array of numbers between 0 and 1
 * @param {Element|null} [options.root=null] - The element that is used as the viewport for checking visibility
 * @param {string} [options.rootMargin='0px'] - Margin around the root element
 * @param {boolean} [options.triggerOnce=false] - Whether to unobserve after the element becomes visible
 * @returns {[React.RefObject<HTMLDivElement>, boolean, IntersectionObserverEntry | null]} - Tuple containing ref to attach, inView state, and the entry
 */
export const useIntersectionObserver = ({
  threshold = 0,
  root = null,
  rootMargin = "0px",
  triggerOnce = false,
}: {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
} = {}): [
  React.RefObject<HTMLDivElement | null>,
  boolean,
  IntersectionObserverEntry | null,
] => {
  const [inView, setInView] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Disconnect the previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create a new IntersectionObserver
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }
        // Update state based on whether the element is intersecting
        setInView(entry.isIntersecting);
        setEntry(entry);

        // If triggerOnce is true and the element is intersecting, unobserve
        if (entry.isIntersecting && triggerOnce) {
          observerRef.current?.unobserve(entry.target);
        }
      },
      { threshold, root, rootMargin }
    );

    // Start observing when the ref is attached to an element
    const currentElement = elementRef.current;
    if (currentElement) {
      observerRef.current.observe(currentElement);
    }

    // Cleanup function to disconnect the observer
    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, root, rootMargin, triggerOnce]);

  return [elementRef, inView, entry];
};
