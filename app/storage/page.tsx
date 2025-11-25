"use client";

import React from "react";
import Explorer from "@/components/Storage/Explorer";
// page only composes Explorer — cards are handled inside Explorer

export default function StoragePage() {
  return (
    // make the page exactly the viewport and prevent body/page scrolling —
    // keep the header fixed and let the inner container scroll instead
    <div className="h-screen overflow-hidden flex items-start justify-center px-4 py-16 md:py-20 lg:py-24 bg-linear-to-b from-transparent via-transparent to-transparent">
      <div className="w-full max-w-7xl h-full flex flex-col">
        <div className="mb-6 text-left md:text-center flex-none">
          <h1 className="text-3xl font-semibold">Storage</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse files and folders in your cloud storage.
          </p>
        </div>

        {/* content area should take remaining height and be scrollable */}
        <div className="mx-auto w-full flex-1 overflow-auto">
          <div className="bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-xl h-full">
            <Explorer />
          </div>
        </div>
      </div>
    </div>
  );
}
