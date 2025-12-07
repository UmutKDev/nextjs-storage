"use client";

import React from "react";
import Explorer from "@/components/Storage/Explorer";
import { useCloudList } from "@/hooks/useCloudList";
import { useStorage } from "@/components/Storage/StorageProvider";
// page only composes Explorer — cards are handled inside Explorer

export default function StoragePage() {
  const { currentPath } = useStorage();
  const { breadcrumbQuery, objectsQuery, directoriesQuery, invalidates } =
    useCloudList(currentPath);

  return (
    // make the page exactly the viewport and prevent body/page scrolling —
    // keep the header fixed and let the inner container scroll instead
    <div className="h-screen overflow-hidden flex items-start justify-center p-4 pt-24 bg-linear-to-b from-transparent via-transparent to-transparent">
      <div className="w-full h-full flex flex-col">
        <div className="mb-4 text-left md:text-center flex-none">
          <h1 className="text-2xl font-semibold">Storage</h1>
        </div>

        {/* content area should take remaining height and be scrollable */}
        <div className="mx-auto w-full flex-1 overflow-hidden">
          <div className="bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-4 shadow-xl h-full">
            <Explorer
              queries={{
                breadcrumbQuery,
                objectsQuery,
                directoriesQuery,
              }}
              currentPath={currentPath}
              invalidates={invalidates}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
