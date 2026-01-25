"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StorageBrowser from "@/components/storage-browser/StorageBrowser";
import ExplorerEmptyState from "./ExplorerEmptyState";
import ExplorerLockedState from "./ExplorerLockedState";
import ExplorerInfiniteLoader from "./ExplorerInfiniteLoader";
import FileDragOverlay from "../overlays/FileDragOverlay";
import UploadProgressOverlay from "../overlays/UploadProgressOverlay";
import ExplorerContextMenu from "./ExplorerContextMenu";
import { useExplorerEncryption } from "../../contexts/ExplorerEncryptionContext";
import { useExplorerQuery } from "../../contexts/ExplorerQueryContext";
import { useExplorerUI } from "../../contexts/ExplorerUIContext";
import { useExplorerUpload } from "../../contexts/ExplorerUploadContext";
import { useExplorerContextMenu } from "../../stores/explorerContextMenu.store";
import { useExplorerFiltering } from "../../hooks/useExplorerFiltering";
import { useExplorerInfiniteLoad } from "../../hooks/useExplorerInfiniteLoad";

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
  const {
    loadMoreTriggerRef,
    loadMore,
    canLoadMore,
    isFetchingMore,
    loadedItemCount,
    totalItemCount,
  } = useExplorerInfiniteLoad({
    objectItems,
    directoryItems,
  });

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
    <>
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

              <div ref={loadMoreTriggerRef} className="h-12 w-full" />
              {isFetchingMore ? (
                <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Daha fazlası yükleniyor...
                </div>
              ) : canLoadMore ? (
                <div className="flex items-center justify-center py-4">
                  <Button variant="outline" size="sm" onClick={loadMore}>
                    Daha fazla getir
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <ExplorerInfiniteLoader
        loadedItemCount={loadedItemCount}
        totalItemCount={totalItemCount}
        canLoadMore={canLoadMore}
        isFetchingMore={isFetchingMore}
        onLoadMore={loadMore}
      />
    </>
  );
}
