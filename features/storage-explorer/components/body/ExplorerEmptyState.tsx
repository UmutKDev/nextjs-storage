"use client";

import React from "react";
import EmptyState from "@/components/Storage/EmptyState";

export default function ExplorerEmptyState() {
  return (
    <div className="h-full grid place-items-center">
      <EmptyState
        title="Klasör Boş"
        description="Bu klasörde henüz dosya veya klasör yok."
      />
    </div>
  );
}
