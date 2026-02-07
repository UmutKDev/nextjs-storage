"use client";

import React from "react";
import { cn } from "@/lib/utils";

type SmartGalleryItem = {
  key: string;
  aspectRatio: number;
  render: (box: { width: number; height: number }) => React.ReactNode;
};

type PositionedItem = SmartGalleryItem & {
  width: number;
  height: number;
  left: number;
  top: number;
};

function computeJustifiedLayout(
  items: SmartGalleryItem[],
  containerWidth: number,
  gap: number,
  targetRowHeight: number,
  tolerance: number,
  maxItemsPerRow: number,
): { positioned: PositionedItem[]; height: number } {
  if (!containerWidth || items.length === 0) {
    return { positioned: [], height: 0 };
  }

  const safeTarget = Math.max(targetRowHeight, 120);
  const positioned: PositionedItem[] = [];
  let row: SmartGalleryItem[] = [];
  let rowAspectSum = 0;
  let y = 0;

  const clampAspect = (a: number) => Math.min(Math.max(a || 1, 0.2), 6);

  const flushRow = (isLast: boolean) => {
    if (row.length === 0) return;
    const totalGap = gap * Math.max(row.length - 1, 0);
    const rowHeight = (containerWidth - totalGap) / rowAspectSum;
    const maxHeight = safeTarget * (1 + tolerance);
    const minHeight = safeTarget * (1 - tolerance);

    const finalHeight = isLast
      ? Math.max(Math.min(rowHeight, maxHeight), minHeight)
      : Math.min(Math.max(rowHeight, minHeight), maxHeight);

    let x = 0;
    row.forEach((item) => {
      const aspect = clampAspect(item.aspectRatio);
      const width = finalHeight * aspect;
      positioned.push({
        ...item,
        width,
        height: finalHeight,
        left: x,
        top: y,
      });
      x += width + gap;
    });

    y += finalHeight + gap;
    row = [];
    rowAspectSum = 0;
  };

  items.forEach((item, idx) => {
    const aspect = clampAspect(item.aspectRatio);
    row.push({ ...item, aspectRatio: aspect });
    rowAspectSum += aspect;

    const totalGap = gap * Math.max(row.length - 1, 0);
    const rowHeight = (containerWidth - totalGap) / rowAspectSum;
    const withinTolerance = rowHeight <= safeTarget * (1 + tolerance);
    const isLast = idx === items.length - 1;

    const hitsRowLimit = row.length >= maxItemsPerRow;

    if (withinTolerance || hitsRowLimit || isLast) {
      flushRow(isLast);
    }
  });

  const layoutHeight = positioned.length
    ? Math.max(...positioned.map((p) => p.top + p.height))
    : 0;

  return { positioned, height: layoutHeight };
}

export default function SmartGallery({
  items,
  gap = 12,
  targetRowHeight = 280,
  tolerance = 0.25,
  maxItemsPerRow = Number.POSITIVE_INFINITY,
  className,
  scrollElementRef,
}: {
  items: SmartGalleryItem[];
  gap?: number;
  targetRowHeight?: number;
  tolerance?: number;
  maxItemsPerRow?: number;
  className?: string;
  scrollElementRef?: React.RefObject<HTMLElement | null>;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = React.useState(0);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [viewportHeight, setViewportHeight] = React.useState(0);
  const [containerOffsetTop, setContainerOffsetTop] = React.useState(0);
  const rafRef = React.useRef(0);

  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const nextWidth = entry.contentRect.width;
      setWidth((prev) => (Math.abs(prev - nextWidth) < 1 ? prev : nextWidth));
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const { positioned, height } = React.useMemo(
    () =>
      computeJustifiedLayout(
        items,
        width,
        gap,
        targetRowHeight,
        tolerance,
        maxItemsPerRow,
      ),
    [gap, items, maxItemsPerRow, targetRowHeight, tolerance, width],
  );

  React.useLayoutEffect(() => {
    const el = containerRef.current;
    const scrollEl = scrollElementRef?.current;
    if (!el || !scrollEl) return;

    let offset = 0;
    let current: HTMLElement | null = el;
    while (current && current !== scrollEl) {
      offset += current.offsetTop;
      current = current.offsetParent as HTMLElement | null;
    }
    setContainerOffsetTop(offset);
  }, [scrollElementRef, positioned.length, width]);

  React.useEffect(() => {
    const scrollEl = scrollElementRef?.current;
    if (!scrollEl) return;

    setViewportHeight(scrollEl.clientHeight);
    setScrollTop(scrollEl.scrollTop);

    const handleScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setScrollTop(scrollEl.scrollTop);
      });
    };

    const handleResize = (entries: ResizeObserverEntry[]) => {
      const entry = entries[0];
      if (entry) setViewportHeight(entry.contentRect.height);
    };

    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(scrollEl);

    return () => {
      cancelAnimationFrame(rafRef.current);
      scrollEl.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [scrollElementRef]);

  const overscan = targetRowHeight * 2;
  const visibleItems = React.useMemo(() => {
    if (!scrollElementRef?.current) return positioned;

    const visibleStart = scrollTop - containerOffsetTop - overscan;
    const visibleEnd =
      scrollTop - containerOffsetTop + viewportHeight + overscan;

    return positioned.filter(
      (item) => item.top + item.height > visibleStart && item.top < visibleEnd,
    );
  }, [
    positioned,
    scrollTop,
    containerOffsetTop,
    viewportHeight,
    overscan,
    scrollElementRef,
  ]);

  const fallbackHeight = height || (items.length > 0 ? targetRowHeight : 0);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      style={{ height: fallbackHeight }}
    >
      {visibleItems.map((item) => (
        <div
          key={item.key}
          style={{
            position: "absolute",
            left: item.left,
            top: item.top,
            width: item.width,
            height: item.height,
          }}
        >
          {item.render({ width: item.width, height: item.height })}
        </div>
      ))}
    </div>
  );
}
