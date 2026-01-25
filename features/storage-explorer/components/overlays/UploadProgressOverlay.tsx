"use client";

import React from "react";
import { UploadCloud } from "lucide-react";
import { useExplorerUpload } from "../../contexts/ExplorerUploadContext";

export default function UploadProgressOverlay() {
  const { activeUploads, aggregatedUploadProgress } = useExplorerUpload();

  if (activeUploads.length === 0) return null;

  return (
    <div className="absolute left-1/2 top-4 z-30 w-[min(92vw,440px)] -translate-x-1/2 rounded-2xl border border-border/70 bg-card/95 px-4 py-3 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60">
            <UploadCloud className="h-4 w-4 text-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              Yukleme devam ediyor
            </span>
            <span className="text-xs text-muted-foreground">
              {activeUploads.length} dosya
            </span>
          </div>
        </div>
        <span className="rounded-full border border-border/70 bg-background/60 px-2.5 py-1 text-xs font-medium tabular-nums text-foreground">
          {aggregatedUploadProgress}%
        </span>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
          <span>Toplam ilerleme</span>
          <span>{aggregatedUploadProgress}%</span>
        </div>
        <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-muted/70">
          <div
            className="h-full rounded-full bg-gradient-to-r from-foreground/30 via-foreground/70 to-foreground/30 transition-[width] duration-200"
            style={{ width: `${aggregatedUploadProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
