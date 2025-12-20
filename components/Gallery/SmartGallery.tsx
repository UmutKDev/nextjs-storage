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

function computeLayout(
  items: SmartGalleryItem[],
  containerWidth: number,
  gap: number,
  minColumnWidth: number
): { positioned: PositionedItem[]; height: number } {
  if (!containerWidth || items.length === 0) {
    return { positioned: [], height: 0 };
  }

  const columnCount = Math.max(
    1,
    Math.floor((containerWidth + gap) / (minColumnWidth + gap))
  );
  const columnWidth =
    (containerWidth - gap * Math.max(columnCount - 1, 0)) / columnCount;

  const columnHeights = new Array<number>(columnCount).fill(0);
  const positioned: PositionedItem[] = [];

  items.forEach((item) => {
    const safeAspect = Math.min(Math.max(item.aspectRatio || 1, 0.25), 5);
    const height = columnWidth / safeAspect;

    let targetCol = 0;
    for (let i = 1; i < columnCount; i += 1) {
      if (columnHeights[i] < columnHeights[targetCol]) {
        targetCol = i;
      }
    }

    const top = columnHeights[targetCol];
    const left = targetCol * (columnWidth + gap);

    columnHeights[targetCol] = top + height + gap;

    positioned.push({
      ...item,
      width: columnWidth,
      height,
      left,
      top,
    });
  });

  const layoutHeight = positioned.length
    ? Math.max(...columnHeights) - gap
    : 0;

  return { positioned, height: Math.max(layoutHeight, 0) };
}

export default function SmartGallery({
  items,
  gap = 12,
  minColumnWidth = 240,
  className,
}: {
  items: SmartGalleryItem[];
  gap?: number;
  minColumnWidth?: number;
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
    () => computeLayout(items, width, gap, minColumnWidth),
    [gap, items, minColumnWidth, width]
  );

  const fallbackHeight =
    height || (items.length > 0 ? minColumnWidth : 0);

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
