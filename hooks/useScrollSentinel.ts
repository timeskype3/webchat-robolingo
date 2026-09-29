"use client";

import { useEffect, type RefObject } from "react";

interface Params {
  viewport: RefObject<HTMLDivElement | null>;
  sentinel: RefObject<HTMLDivElement | null>;
  enabled: boolean;
  loadMore: () => Promise<void>;
  direction: "top" | "bottom";
  itemCount: number;
}

export function useScrollSentinel({
  viewport,
  sentinel,
  enabled,
  loadMore,
  direction,
  itemCount,
}: Params) {
  useEffect(() => {
    const root = viewport.current;
    const target = sentinel.current;
    if (!enabled || !root || !target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadMore();
      },
      {
        root,
        rootMargin:
          direction === "top" ? "120px 0px 0px 0px" : "0px 0px 120px 0px",
      },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [viewport, sentinel, enabled, loadMore, direction, itemCount]);
}
