"use client";

import React from "react";
import StorageBrowser from "@/components/storage-browser/StorageBrowser";
import ExplorerEmptyState from "./ExplorerEmptyState";
import ExplorerLockedState from "./ExplorerLockedState";
import FileDragOverlay from "../overlays/FileDragOverlay";
import UploadProgressOverlay from "../overlays/UploadProgressOverlay";
import ExplorerContextMenu from "./ExplorerContextMenu";
import { useExplorerEncryption } from "../../contexts/ExplorerEncryptionContext";
import { useExplorerQuery } from "../../contexts/ExplorerQueryContext";
import { useExplorerUI } from "../../contexts/ExplorerUIContext";
import { useExplorerUpload } from "../../contexts/ExplorerUploadContext";
import { useExplorerContextMenu } from "../../stores/explorerContextMenu.store";
import { useExplorerFiltering } from "../../hooks/useExplorerFiltering";

export default function ExplorerBody() {
  const { isExplorerLocked, isAccessDenied } = useExplorerEncryption();
  const { objectsQuery, directoriesQuery } = useExplorerQuery();
  const { isNavigatingBetweenFolders, searchQuery } = useExplorerUI();
  const {
    isFileDragActive,
    trackFileDragEnter,
    trackFileDragLeave,
    trackFileDragOver,
    processFileDropEvent,
  } = useExplorerUpload();
  const { scrollContainerRef } = useExplorerContextMenu();
  const {
    objectItems,
    directoryItems,
    filteredObjectItems,
    filteredDirectoryItems,
  } = useExplorerFiltering();

  const isLoading =
    !isAccessDenied &&
    (isNavigatingBetweenFolders ||
      objectsQuery.isLoading ||
      directoriesQuery.isLoading);

  const showEmptyState =
    objectsQuery.isSuccess &&
    directoriesQuery.isSuccess &&
    !objectsQuery.isLoading &&
    !directoriesQuery.isLoading &&
    !isNavigatingBetweenFolders &&
    !searchQuery &&
    objectItems.length === 0 &&
    directoryItems.length === 0;

  return (
    <div
      className="flex-1 overflow-hidden relative min-h-0"
      onDragEnter={trackFileDragEnter}
      onDragLeave={trackFileDragLeave}
      onDragOver={trackFileDragOver}
      onDrop={processFileDropEvent}
    >
      <FileDragOverlay isVisible={isFileDragActive} />
      <UploadProgressOverlay />

      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-auto p-4 pb-6 relative"
      >
        {isExplorerLocked ? (
          <ExplorerLockedState />
        ) : (
          <>
            <StorageBrowser
              directories={filteredDirectoryItems}
              contents={filteredObjectItems}
              loading={isLoading}
            />

            {showEmptyState ? <ExplorerEmptyState /> : null}
            <ExplorerContextMenu
              files={objectItems}
              directories={directoryItems}
              isLoading={isLoading}
            />
          </>
        )}
      </div>
    </div>
  );
}
