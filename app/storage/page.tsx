"use client";

import React, { useState } from "react";
import Explorer from "@/components/Storage/Explorer";
import Sidebar from "@/components/Storage/Sidebar";
import { useInfiniteCloudList } from "@/hooks/useCloudList";
import { useStorage } from "@/components/Storage/StorageProvider";
import { useEncryptedFolders } from "@/components/Storage/EncryptedFoldersProvider";

export default function StoragePage() {
  const { currentPath } = useStorage();
  const { isFolderEncrypted, isFolderUnlocked } = useEncryptedFolders();

  const pageSize = 50;

  const isCurrentEncrypted = isFolderEncrypted(currentPath);
  const isCurrentUnlocked = isFolderUnlocked(currentPath);
  const isCurrentLocked = isCurrentEncrypted && !isCurrentUnlocked;

  const { breadcrumbQuery, objectsQuery, directoriesQuery, invalidates } =
    useInfiniteCloudList(currentPath, {
      take: pageSize,
      refetchInterval: isCurrentLocked ? false : 5000,
      objectsEnabled: !isCurrentLocked,
      directoriesEnabled: !isCurrentLocked,
    });

  // Lifted state for modals
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden flex bg-background">
      {/* Sidebar */}
      <Sidebar
        className="hidden md:flex flex-none w-64 pt-24"
        onCreateFolder={() => setShowCreateFolder(true)}
        onUpload={() => setShowUpload(true)}
      />

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-3/4 max-w-[300px] bg-background border-r shadow-lg animate-in slide-in-from-left pt-20"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              className="w-full h-full border-none bg-transparent"
              onCreateFolder={() => {
                setShowCreateFolder(true);
                setMobileMenuOpen(false);
              }}
              onUpload={() => {
                setShowUpload(true);
                setMobileMenuOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden pt-20 md:pt-24 px-2 md:px-4 pb-4">
        <div className="w-full h-full flex flex-col">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl md:rounded-2xl shadow-sm h-full overflow-hidden flex flex-col">
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
              onOpenMobileSidebar={() => setMobileMenuOpen(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
