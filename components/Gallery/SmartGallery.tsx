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
  tolerance: number
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

    if (withinTolerance || isLast) {
      flushRow(isLast);
    }
  });

  const layoutHeight = positioned.length ? Math.max(...positioned.map((p) => p.top + p.height)) : 0;

  return { positioned, height: layoutHeight };
}

export default function SmartGallery({
  items,
  gap = 12,
  targetRowHeight = 280,
  tolerance = 0.25,
  className,
}: {
  items: SmartGalleryItem[];
  gap?: number;
  targetRowHeight?: number;
  tolerance?: number;
  className?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const nextWidth = entry.contentRect.width;
      setWidth((prev) =>
        Math.abs(prev - nextWidth) < 1 ? prev : nextWidth
      );
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const { positioned, height } = React.useMemo(
    () =>
      computeJustifiedLayout(items, width, gap, targetRowHeight, tolerance),
    [gap, items, targetRowHeight, tolerance, width]
  );

  const fallbackHeight = height || (items.length > 0 ? targetRowHeight : 0);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      style={{ height: fallbackHeight }}
    >
      {positioned.map((item) => (
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
