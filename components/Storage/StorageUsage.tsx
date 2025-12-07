"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import type { CloudUserStorageUsageResponseModel } from "@/Service/Generates/api";

function humanFileSize(bytes?: number) {
  if (!bytes || bytes === 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
}

export default function StorageUsage({
  usage,
  className,
}: {
  usage?: CloudUserStorageUsageResponseModel | undefined;
  className?: string;
}) {
  if (!usage) return null;

  const percent = Math.min(Math.max(usage.UsagePercentage ?? 0, 0), 100);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-sm font-medium truncate text-foreground">
              Storage
            </div>
            <div className="text-xs text-muted-foreground truncate hidden sm:block">
              {humanFileSize(usage.UsedStorageInBytes)} used of{" "}
              {humanFileSize(usage.MaxStorageInBytes)}
            </div>
          </div>

          <div
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-semibold",
              usage.IsLimitExceeded
                ? "bg-destructive/10 text-destructive"
                : "bg-muted/10 text-foreground"
            )}
          >
            {Math.round(percent)}%
          </div>
        </div>

        <div className="mt-2">
          <Progress value={percent} />
        </div>

        {/* details only show on very small screens, below sm we show a compact line */}
        <div className="mt-2 text-xs text-muted-foreground sm:hidden">
          {humanFileSize(usage.UsedStorageInBytes)} used of{" "}
          {humanFileSize(usage.MaxStorageInBytes)}
        </div>
      </div>

      {/* optional compact label on the right for larger screens */}
    </div>
  );
}
