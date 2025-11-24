"use client";

import React from "react";
import { FileMinus } from "lucide-react";

export default function EmptyState({
  title = "No items",
  description = "There are no files or folders here.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-6 text-center">
        <div className="rounded-full bg-muted/30 p-3">
          <FileMinus className="text-muted-foreground" />
        </div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}
