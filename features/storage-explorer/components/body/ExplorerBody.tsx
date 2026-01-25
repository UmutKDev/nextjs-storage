"use client";

import React from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StorageBrowser from "@/components/storage-browser/StorageBrowser";
import EditFileModal from "@/components/Storage/EditFileModal";
import ExplorerEmptyState from "./ExplorerEmptyState";
import ExplorerLockedState from "./ExplorerLockedState";
import ExplorerInfiniteLoader from "./ExplorerInfiniteLoader";
import FileDragOverlay from "../overlays/FileDragOverlay";
import UploadProgressOverlay from "../overlays/UploadProgressOverlay";
import { useStorage } from "@/components/Storage/StorageProvider";
import { useEncryptedFolders } from "@/components/Storage/EncryptedFoldersProvider";
import { useDirectoryMetadata } from "@/components/storage-browser/hooks/useDirectoryMetadata";
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
import type {
  CloudObject,
  Directory,
} from "@/components/storage-browser/types/storage-browser.types";

export default function ExplorerBody() {
  const { setCurrentPath } = useStorage();
  const { promptUnlock } = useEncryptedFolders();
  const { getDirectoryMetadata } = useDirectoryMetadata();
  const { isExplorerLocked, isAccessDenied } = useExplorerEncryption();
  const { objectsQuery, directoriesQuery, currentPath } = useExplorerQuery();
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
  const {
    selectedItemKeys,
    replaceSelectedItemKeys,
    clearSelection,
    selectAllVisibleItems,
  } = useExplorerSelection();
  const {
    deletingStatusByKey,
    setItemPendingDeletion,
    deleteSelectedItems,
  } = useExplorerDelete();
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
  const [fileBeingEdited, setFileBeingEdited] =
    React.useState<CloudObject | null>(null);
  const [clipboard, setClipboard] = React.useState<{
    keys: string[];
    mode: "copy" | "cut";
  } | null>(null);
  const selectionAnchorRef = React.useRef<string | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [contextMenu, setContextMenu] = React.useState<{
    x: number;
    y: number;
    key: string;
    type: "file" | "folder";
  } | null>(null);
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

  const orderedItems = React.useMemo(() => {
    const items: {
      key: string;
      type: "file" | "folder";
      item: CloudObject | Directory;
    }[] = [];
    filteredDirectoryItems.forEach((directory, index) => {
      items.push({
        key: directory.Prefix || `dir-${index}`,
        type: "folder",
        item: directory,
      });
    });
    filteredObjectItems.forEach((file, index) => {
      items.push({
        key: file.Path?.Key ?? `file-${index}`,
        type: "file",
        item: file,
      });
    });
    return items;
  }, [filteredDirectoryItems, filteredObjectItems]);

  const orderedKeys = React.useMemo(
    () => orderedItems.map((item) => item.key),
    [orderedItems],
  );

  const orderedItemByKey = React.useMemo(() => {
    const map = new Map<
      string,
      { type: "file" | "folder"; item: CloudObject | Directory }
    >();
    orderedItems.forEach((entry) => {
      map.set(entry.key, { type: entry.type, item: entry.item });
    });
    return map;
  }, [orderedItems]);

  React.useEffect(() => {
    if (selectedItemKeys.size === 0) {
      selectionAnchorRef.current = null;
      return;
    }
    let lastSelected: string | null = null;
    orderedKeys.forEach((key) => {
      if (selectedItemKeys.has(key)) lastSelected = key;
    });
    if (lastSelected) selectionAnchorRef.current = lastSelected;
  }, [orderedKeys, selectedItemKeys]);

  const getActiveKey = React.useCallback(() => {
    if (selectionAnchorRef.current) return selectionAnchorRef.current;
    for (const key of orderedKeys) {
      if (selectedItemKeys.has(key)) return key;
    }
    return orderedKeys[0];
  }, [orderedKeys, selectedItemKeys]);

  const replaceSelectionWithRange = React.useCallback(
    (anchorKey: string, targetKey: string) => {
      const anchorIndex = orderedKeys.indexOf(anchorKey);
      const targetIndex = orderedKeys.indexOf(targetKey);
      if (anchorIndex === -1 || targetIndex === -1) return;
      const [start, end] =
        anchorIndex < targetIndex
          ? [anchorIndex, targetIndex]
          : [targetIndex, anchorIndex];
      replaceSelectedItemKeys(new Set(orderedKeys.slice(start, end + 1)));
    },
    [orderedKeys, replaceSelectedItemKeys],
  );

  const openItem = React.useCallback(
    (key: string) => {
      const entry = orderedItemByKey.get(key);
      if (!entry) return;
      if (entry.type === "folder") {
        const directory = entry.item as Directory;
        const directoryMetadata = getDirectoryMetadata(directory);
        if (!directoryMetadata.normalizedPath) return;
        if (directoryMetadata.isEncrypted && !directoryMetadata.isUnlocked) {
          promptUnlock({
            path: directoryMetadata.normalizedPath,
            label: directoryMetadata.displayName,
            onSuccess: () =>
              setCurrentPath(directoryMetadata.normalizedPath),
          });
          return;
        }
        setCurrentPath(directoryMetadata.normalizedPath);
      } else {
        setActivePreviewFile(entry.item as CloudObject);
      }
    },
    [
      getDirectoryMetadata,
      orderedItemByKey,
      promptUnlock,
      setActivePreviewFile,
      setCurrentPath,
    ],
  );

  const renameItem = React.useCallback(
    (key: string) => {
      const entry = orderedItemByKey.get(key);
      if (!entry) return;
      if (entry.type === "folder") {
        requestRenameFolder(entry.item as Directory);
      } else {
        setFileBeingEdited(entry.item as CloudObject);
      }
    },
    [orderedItemByKey, requestRenameFolder],
  );

  const openContextMenu = React.useCallback(
    (
      item: CloudObject | Directory,
      itemType: "file" | "folder",
      point: { x: number; y: number },
    ) => {
      const key =
        itemType === "file"
          ? (item as CloudObject).Path?.Key
          : (item as Directory).Prefix;
      if (!key || !scrollContainerRef.current) return;
      if (!selectedItemKeys.has(key)) {
        replaceSelectedItemKeys(new Set([key]));
      }
      const container = scrollContainerRef.current;
      const rect = container.getBoundingClientRect();
      setContextMenu({
        x: point.x - rect.left + container.scrollLeft,
        y: point.y - rect.top + container.scrollTop,
        key,
        type: itemType,
      });
    },
    [replaceSelectedItemKeys, selectedItemKeys],
  );

  React.useEffect(() => {
    if (!contextMenu) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-context-menu]")) return;
      setContextMenu(null);
    };
    const handleScroll = () => setContextMenu(null);
    window.addEventListener("mousedown", handlePointerDown);
    scrollContainerRef.current?.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      scrollContainerRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, [contextMenu]);

  React.useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tagName = target.tagName.toLowerCase();
      return (
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        target.isContentEditable
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isEditableTarget(event.target)) return;
      if (orderedKeys.length === 0) return;

      const isCtrlOrCmd = event.metaKey || event.ctrlKey;

      if (isCtrlOrCmd && event.key.toLowerCase() === "a") {
        event.preventDefault();
        selectAllVisibleItems(orderedKeys);
        selectionAnchorRef.current = orderedKeys[orderedKeys.length - 1] ?? null;
        return;
      }

      if (event.key === "Escape") {
        setContextMenu(null);
        clearSelection();
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedItemKeys.size > 0) {
          event.preventDefault();
          void deleteSelectedItems();
        }
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        if (selectedItemKeys.size > 0) {
          event.preventDefault();
          const activeKey = getActiveKey();
          if (activeKey) openItem(activeKey);
        }
        return;
      }

      if (event.key === "F2") {
        if (selectedItemKeys.size === 1) {
          event.preventDefault();
          const activeKey = getActiveKey();
          if (activeKey) renameItem(activeKey);
        }
        return;
      }

      if (isCtrlOrCmd && event.key.toLowerCase() === "c") {
        if (selectedItemKeys.size > 0) {
          event.preventDefault();
          setClipboard({
            keys: Array.from(selectedItemKeys),
            mode: "copy",
          });
        }
        return;
      }

      if (isCtrlOrCmd && event.key.toLowerCase() === "x") {
        if (selectedItemKeys.size > 0) {
          event.preventDefault();
          setClipboard({
            keys: Array.from(selectedItemKeys),
            mode: "cut",
          });
        }
        return;
      }

      if (isCtrlOrCmd && event.key.toLowerCase() === "v") {
        if (!clipboard?.keys.length) return;
        event.preventDefault();
        if (clipboard.mode === "copy") {
          toast.error("Copy is not supported yet");
          return;
        }
        const activeKey = getActiveKey();
        const activeEntry = activeKey
          ? orderedItemByKey.get(activeKey)
          : null;
        const destinationKey =
          activeEntry?.type === "folder"
            ? (activeEntry.item as Directory).Prefix ?? currentPath ?? ""
            : currentPath ?? "";
        void updateItemsLocation(clipboard.keys, destinationKey).then(
          (moved) => {
            if (moved) setClipboard(null);
          },
        );
        return;
      }

      const arrowKeys = new Set([
        "ArrowDown",
        "ArrowUp",
        "ArrowLeft",
        "ArrowRight",
      ]);
      if (arrowKeys.has(event.key)) {
        event.preventDefault();
        const direction =
          event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
        const activeKey = getActiveKey();
        const currentIndex = activeKey
          ? orderedKeys.indexOf(activeKey)
          : -1;
        const nextIndex = Math.min(
          Math.max(currentIndex + direction, 0),
          orderedKeys.length - 1,
        );
        const nextKey = orderedKeys[nextIndex];
        if (!nextKey) return;

        if (event.shiftKey) {
          const anchorKey = selectionAnchorRef.current ?? activeKey ?? nextKey;
          replaceSelectionWithRange(anchorKey, nextKey);
        } else {
          replaceSelectedItemKeys(new Set([nextKey]));
          selectionAnchorRef.current = nextKey;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    clearSelection,
    clipboard,
    currentPath,
    deleteSelectedItems,
    getActiveKey,
    openItem,
    orderedItemByKey,
    orderedKeys,
    renameItem,
    replaceSelectedItemKeys,
    replaceSelectionWithRange,
    selectAllVisibleItems,
    selectedItemKeys,
    setContextMenu,
    updateItemsLocation,
  ]);

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

        <div
          ref={scrollContainerRef}
          className="absolute inset-0 overflow-y-auto p-4"
        >
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
                onEditFile={setFileBeingEdited}
                onItemContextMenu={openContextMenu}
              />

              {showEmptyState ? <ExplorerEmptyState /> : null}

              {contextMenu ? (
                <div
                  data-context-menu
                  className="absolute z-50 min-w-[190px] rounded-md border bg-popover text-popover-foreground shadow-lg p-1"
                  style={{ left: contextMenu.x, top: contextMenu.y }}
                >
                  <button
                    type="button"
                    className="w-full text-left text-sm px-2.5 py-2 rounded-sm hover:bg-accent"
                    onClick={() => {
                      openItem(contextMenu.key);
                      setContextMenu(null);
                    }}
                  >
                    {contextMenu.type === "folder"
                      ? "Klasörü aç"
                      : "Önizleme"}
                  </button>
                  {selectedItemKeys.size === 1 ? (
                    <button
                      type="button"
                      className="w-full text-left text-sm px-2.5 py-2 rounded-sm hover:bg-accent"
                      onClick={() => {
                        renameItem(contextMenu.key);
                        setContextMenu(null);
                      }}
                    >
                      {contextMenu.type === "folder" ? "Yeniden adlandır" : "Düzenle"}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="w-full text-left text-sm px-2.5 py-2 rounded-sm hover:bg-accent"
                    onClick={() => {
                      setClipboard({
                        keys: Array.from(selectedItemKeys),
                        mode: "cut",
                      });
                      setContextMenu(null);
                    }}
                  >
                    Kes
                  </button>
                  <button
                    type="button"
                    className="w-full text-left text-sm px-2.5 py-2 rounded-sm hover:bg-accent"
                    onClick={() => {
                      setClipboard({
                        keys: Array.from(selectedItemKeys),
                        mode: "copy",
                      });
                      setContextMenu(null);
                    }}
                  >
                    Kopyala
                  </button>
                  <button
                    type="button"
                    className="w-full text-left text-sm px-2.5 py-2 rounded-sm hover:bg-accent"
                    onClick={() => {
                      if (!clipboard?.keys.length) return;
                      if (clipboard.mode === "copy") {
                        toast.error("Copy is not supported yet");
                        setContextMenu(null);
                        return;
                      }
                      const entry = orderedItemByKey.get(contextMenu.key);
                      const destinationKey =
                        entry?.type === "folder"
                          ? (entry.item as Directory).Prefix ?? currentPath ?? ""
                          : currentPath ?? "";
                      void updateItemsLocation(
                        clipboard.keys,
                        destinationKey,
                      ).then((moved) => {
                        if (moved) setClipboard(null);
                      });
                      setContextMenu(null);
                    }}
                    disabled={!clipboard?.keys.length}
                  >
                    Yapıştır
                  </button>
                  <div className="my-1 h-px bg-border" />
                  <button
                    type="button"
                    className="w-full text-left text-sm px-2.5 py-2 rounded-sm text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (selectedItemKeys.size > 1) {
                        void deleteSelectedItems();
                        setContextMenu(null);
                        return;
                      }
                      const entry = orderedItemByKey.get(contextMenu.key);
                      if (entry) {
                        if (entry.type === "folder") {
                          setItemPendingDeletion(entry.item as Directory);
                        } else {
                          setItemPendingDeletion(entry.item as CloudObject);
                        }
                      }
                      setContextMenu(null);
                    }}
                  >
                    Sil
                  </button>
                </div>
              ) : null}

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

      <EditFileModal
        file={fileBeingEdited}
        open={Boolean(fileBeingEdited)}
        onClose={() => setFileBeingEdited(null)}
        onConfirm={async () => {
          setFileBeingEdited(null);
        }}
      />
    </>
  );
}
