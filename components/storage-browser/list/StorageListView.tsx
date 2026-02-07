import React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { StorageListFileRow } from "@/components/storage-browser/list/StorageListFileRow";
import { StorageListFolderRow } from "@/components/storage-browser/list/StorageListFolderRow";
import type {
  CloudObject,
  Directory,
} from "@/components/storage-browser/types/storage-browser.types";
import { useStorageBrowserInteractions } from "@/components/storage-browser/contexts/StorageBrowserInteractionsContext";
import { useExplorerContextMenuStore } from "@/features/storage-explorer/stores/explorerContextMenu.store";

const ROW_HEIGHT_ESTIMATE = 52;
const SKELETON_COUNT = 4;
const VIRTUALIZER_OVERSCAN = 10;

type ListItem =
  | { type: "directory"; data: Directory; key: string }
  | { type: "file"; data: CloudObject; key: string }
  | { type: "skeleton"; key: string };

type StorageListViewProps = {
  directories?: Directory[];
  files?: CloudObject[];
};

export const StorageListView = ({
  directories,
  files,
}: StorageListViewProps) => (
  <StorageListViewContent directories={directories} files={files} />
);

const StorageListViewContent = ({
  directories,
  files,
}: StorageListViewProps) => {
  const { isLoading } = useStorageBrowserInteractions();
  const scrollContainerRef = useExplorerContextMenuStore(
    (state) => state.scrollContainerRef,
  );

  const items = React.useMemo<ListItem[]>(() => {
    const combined: ListItem[] = [];

    for (const [index, directory] of (directories ?? []).entries()) {
      combined.push({
        type: "directory",
        data: directory,
        key: directory.Prefix || `dir-${index}`,
      });
    }

    if (isLoading) {
      for (let i = 0; i < SKELETON_COUNT; i++) {
        combined.push({ type: "skeleton", key: `skeleton-${i}` });
      }
    } else {
      for (const [index, file] of (files ?? []).entries()) {
        combined.push({
          type: "file",
          data: file,
          key: file.Path?.Key ?? `file-${index}`,
        });
      }
    }

    return combined;
  }, [directories, files, isLoading]);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ROW_HEIGHT_ESTIMATE,
    overscan: VIRTUALIZER_OVERSCAN,
  });

  return (
    <div
      className="relative rounded-md border bg-background/50"
      style={{ height: virtualizer.getTotalSize() }}
    >
      {virtualizer.getVirtualItems().map((virtualItem) => {
        const item = items[virtualItem.index];
        const isLast = virtualItem.index === items.length - 1;

        return (
          <div
            key={item.key}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            className={isLast ? "" : "border-b"}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {item.type === "directory" ? (
              <StorageListFolderRow
                directory={item.data}
                directoryKey={item.key}
              />
            ) : item.type === "file" ? (
              <StorageListFileRow file={item.data} fileKey={item.key} />
            ) : (
              <div className="flex items-center gap-4 px-4 py-3">
                <div className="h-8 w-8 rounded bg-muted/30 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-muted/30 animate-pulse" />
                  <div className="h-3 w-1/4 rounded bg-muted/30 animate-pulse" />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
