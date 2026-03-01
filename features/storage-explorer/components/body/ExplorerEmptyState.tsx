"use client";

import React from "react";
import EmptyState from "@/components/Storage/EmptyState";

export default function ExplorerEmptyState() {
  return (
    <div className="h-full grid place-items-center">
      <EmptyState
        title="Empty Folder"
        description="No files or folders in this directory yet."
      />
    </div>
  );
}
