"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingState({
  message = "Loading…",
  compact = false,
  className = "",
}: {
  message?: string;
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <div className={`flex items-center justify-center py-4 ${className}`}>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="animate-spin h-4 w-4" />
          <div className="text-xs">{message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <div className="flex flex-col items-center gap-4 text-center text-muted-foreground">
        <Loader2 className="animate-spin h-6 w-6" />
        <div className="text-sm">{message}</div>
      </div>
    </div>
  );
}
