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
  const used = humanFileSize(usage.UsedStorageInBytes);
  const total = humanFileSize(usage.MaxStorageInBytes);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-2xl font-bold tracking-tight">{Math.round(percent)}%</span>
          <span className="text-xs text-muted-foreground font-medium">Kullanılıyor</span>
        </div>
        <div className="text-xs text-muted-foreground mb-1">
          <span className="font-medium text-foreground">{used}</span> / {total}
        </div>
      </div>

      <Progress value={percent} className="h-2 w-full" />
      
      {usage.IsLimitExceeded && (
        <p className="text-xs text-destructive font-medium mt-1">
          Depolama alanı sınırını aştınız!
        </p>
      )}
    </div>
  );
}
