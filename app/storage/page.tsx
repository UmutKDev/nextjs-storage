"use client";

import React, { useState } from "react";
import Explorer from "@/components/Storage/Explorer";
import Sidebar from "@/components/Storage/Sidebar";
import { useCloudList } from "@/hooks/useCloudList";
import { useStorage } from "@/components/Storage/StorageProvider";

export default function StoragePage() {
  const { currentPath } = useStorage();
  const { breadcrumbQuery, objectsQuery, directoriesQuery, invalidates } =
    useCloudList(currentPath);

  // Lifted state for modals
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="h-screen overflow-hidden flex bg-background">
      {/* Sidebar */}
      <Sidebar
        className="hidden md:flex flex-none w-64 pt-24"
        onCreateFolder={() => setShowCreateFolder(true)}
        onUpload={() => setShowUpload(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden pt-24 px-4 pb-4">
        <div className="w-full h-full flex flex-col">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl shadow-sm h-full overflow-hidden flex flex-col">
            <Explorer
              queries={{
                breadcrumbQuery,
                objectsQuery,
                directoriesQuery,
              }}
              currentPath={currentPath}
              invalidates={invalidates}
              // Pass state down
              showCreateFolder={showCreateFolder}
              setShowCreateFolder={setShowCreateFolder}
              showUpload={showUpload}
              setShowUpload={setShowUpload}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
