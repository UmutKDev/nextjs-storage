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
import { useExplorerEncryption } from "../../contexts/ExplorerEncryptionContext";
import { useExplorerQuery } from "../../contexts/ExplorerQueryContext";
import { useExplorerSelection } from "../../contexts/ExplorerSelectionContext";
import { useExplorerUI } from "../../contexts/ExplorerUIContext";
import { useExplorerUpload } from "../../contexts/ExplorerUploadContext";
import { useExplorerDelete } from "../../hooks/useExplorerDelete";
import { useExplorerExtractZip } from "../../hooks/useExplorerExtractZip";
import { useExplorerFiltering } from "../../hooks/useExplorerFiltering";
import { useExplorerFolderActions } from "../../hooks/useExplorerFolderActions";
import { useExplorerInfiniteLoad } from "../../hooks/useExplorerInfiniteLoad";
import { useExplorerMove } from "../../hooks/useExplorerMove";

export default function ExplorerBody() {
  const { isExplorerLocked, isAccessDenied } = useExplorerEncryption();
  const { objectsQuery, directoriesQuery } = useExplorerQuery();
  const {
    viewMode,
    setViewMode,
    isNavigatingBetweenFolders,
    searchQuery,
    setActivePreviewFile,
  } = useExplorerUI();
  const {
    isFileDragActive,
    trackFileDragEnter,
    trackFileDragLeave,
    trackFileDragOver,
    processFileDropEvent,
  } = useExplorerUpload();
  const { selectedItemKeys, replaceSelectedItemKeys } = useExplorerSelection();
  const { deletingStatusByKey, setItemPendingDeletion } = useExplorerDelete();
  const { extractJobs, setFilePendingExtraction, deleteZipExtractionJob } =
    useExplorerExtractZip();
  const { updateItemsLocation } = useExplorerMove();
  const {
    openMoveItemsModal,
    requestRenameFolder,
    requestConvertFolder,
  } = useExplorerFolderActions();
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
        className="flex-1 overflow-hidden relative"
        onDragEnter={trackFileDragEnter}
        onDragLeave={trackFileDragLeave}
        onDragOver={trackFileDragOver}
        onDrop={processFileDropEvent}
      >
        <FileDragOverlay isVisible={isFileDragActive} />
        <UploadProgressOverlay />

        <div className="absolute inset-0 overflow-y-auto p-4">
          {isExplorerLocked ? (
            <ExplorerLockedState />
          ) : (
            <>
              <StorageBrowser
                directories={filteredDirectoryItems}
                contents={filteredObjectItems}
                onPreview={(file) => setActivePreviewFile(file)}
                loading={isLoading}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onDelete={(entry) => setItemPendingDeletion(entry)}
                deleting={deletingStatusByKey}
                extractJobs={extractJobs}
                selectedItems={selectedItemKeys}
                onSelect={(items) => replaceSelectedItemKeys(items)}
                onMove={(sourceKey, destinationKey) =>
                  updateItemsLocation([sourceKey], destinationKey)
                }
                onMoveClick={(items) => openMoveItemsModal(items)}
                onRenameFolder={requestRenameFolder}
                onConvertFolder={requestConvertFolder}
                onExtractZip={(file) => setFilePendingExtraction(file)}
                onCancelExtractZip={(file) => void deleteZipExtractionJob(file)}
              />

              {showEmptyState ? <ExplorerEmptyState /> : null}

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
