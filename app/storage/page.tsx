"use client";

import React from "react";
import Explorer from "@/components/Storage/Explorer";
// page only composes Explorer — cards are handled inside Explorer

export default function StoragePage() {
  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-16 md:py-20 lg:py-24 bg-linear-to-b from-transparent via-transparent to-transparent">
      <div className="w-full max-w-7xl">
        <div className="mb-6 text-left md:text-center">
          <h1 className="text-3xl font-semibold">Storage</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse files and folders in your cloud storage.
          </p>
        </div>

        <div className="mx-auto w-full">
          <div className="bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-xl">
            <Explorer />
          </div>
        </div>
      </div>
    </div>
  );
}
