import React from "react";
import { useStorage } from "@/components/Storage/StorageProvider";
import { useEncryptedFolders } from "@/components/Storage/EncryptedFoldersProvider";
import { StorageListView } from "@/components/storage-browser/list/StorageListView";
import { StorageGridView } from "@/components/storage-browser/grid/StorageGridView";
import { useItemSelection } from "@/components/storage-browser/hooks/useItemSelection";
import { useThumbnailAspectRatio } from "@/components/storage-browser/hooks/useThumbnailAspectRatio";
import { useDirectoryMetadata } from "@/components/storage-browser/hooks/useDirectoryMetadata";
import { useZipExtractStatus } from "@/components/storage-browser/hooks/useZipExtractStatus";
import type {
  CloudObject,
  Directory,
  ViewMode,
  ZipExtractJobsByKey,
} from "@/components/storage-browser/types/storage-browser.types";

export interface StorageBrowserProps {
  directories?: Directory[];
  contents?: CloudObject[];
  onPreview?: (file: CloudObject) => void;
  loading?: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onDelete?: (item: CloudObject | Directory) => void;
  onExtractZip?: (file: CloudObject) => void;
  onCancelExtractZip?: (file: CloudObject) => void;
  deleting?: Record<string, boolean>;
  extractJobs?: ZipExtractJobsByKey;
  selectedItems: Set<string>;
  onSelect?: (items: Set<string>) => void;
  onMove?: (sourceKey: string, destinationKey: string) => void;
  onMoveClick?: (items: string[]) => void;
  onEditFile?: (file: CloudObject) => void;
  onRenameFolder?: (directory: Directory) => void;
  onConvertFolder?: (directory: Directory) => void;
  onItemContextMenu?: (
    item: CloudObject | Directory,
    itemType: "file" | "folder",
    point: { x: number; y: number },
  ) => void;
}

export default function StorageBrowser({
  directories,
  contents,
  onPreview,
  loading,
  viewMode,
  onDelete,
  onExtractZip,
  onCancelExtractZip,
  deleting = {},
  extractJobs = {},
  selectedItems,
  onSelect,
  onMoveClick,
  onEditFile,
  onRenameFolder,
  onConvertFolder,
  onItemContextMenu,
}: StorageBrowserProps) {
  const { setCurrentPath } = useStorage();
  const { promptUnlock } = useEncryptedFolders();
  const { getDirectoryMetadata } = useDirectoryMetadata();
  const orderedItemKeys = React.useMemo(() => {
    const keys: string[] = [];
    (directories ?? []).forEach((directory, index) => {
      keys.push(directory.Prefix || `dir-${index}`);
    });
    (contents ?? []).forEach((file, index) => {
      keys.push(file.Path?.Key ?? `file-${index}`);
    });
    return keys;
  }, [contents, directories]);
  const { updateSelection, replaceSelection } = useItemSelection({
    selectedItemKeys: selectedItems,
    orderedItemKeys,
    onSelectionChange: onSelect,
  });
  const { thumbnailAspectRatioByKey, updateThumbnailAspectRatio } =
    useThumbnailAspectRatio();
  const { getReadableExtractStatus, getZipActionState } =
    useZipExtractStatus();

  const isLoading = Boolean(loading);
  const isEmptyState = !directories?.length && !contents?.length && !isLoading;

  const handleItemSelection = React.useCallback(
    (
      itemKey: string,
      options?: { allowMultiple?: boolean; rangeSelect?: boolean },
    ) => {
      updateSelection(itemKey, options);
    },
    [updateSelection],
  );

  const handleStorageItemClick = React.useCallback(
    (
      storageItem: CloudObject | Directory,
      itemType: "file" | "folder",
      event: React.MouseEvent,
    ) => {
      const itemKey =
        itemType === "file"
          ? (storageItem as CloudObject).Path?.Key
          : (storageItem as Directory).Prefix;
      if (!itemKey) return;

      if (event.shiftKey) {
        updateSelection(itemKey, { allowMultiple: true, rangeSelect: true });
        return;
      }

      if (event.metaKey || event.ctrlKey) {
        updateSelection(itemKey, { allowMultiple: true });
        return;
      }

      if (itemType === "folder") {
        const directory = storageItem as Directory;
        const directoryMetadata = getDirectoryMetadata(directory);
        if (!directoryMetadata.normalizedPath) return;

        if (directoryMetadata.isEncrypted && !directoryMetadata.isUnlocked) {
          promptUnlock({
            path: directoryMetadata.normalizedPath,
            label: directoryMetadata.displayName,
            onSuccess: () => setCurrentPath(directoryMetadata.normalizedPath),
          });
          return;
        }

        if (!isLoading) setCurrentPath(directoryMetadata.normalizedPath);
      } else {
        if (!isLoading && onPreview) onPreview(storageItem as CloudObject);
      }
    },
    [
      getDirectoryMetadata,
      isLoading,
      onPreview,
      promptUnlock,
      setCurrentPath,
      updateSelection,
    ],
  );

  if (isEmptyState) return null;

  return (
    <>
      {viewMode === "list" ? (
        <StorageListView
          directories={directories}
          files={contents}
          isLoading={isLoading}
          selectedItemKeys={selectedItems}
          deletingByKey={deleting}
          extractJobsByKey={extractJobs}
          onSelectItem={handleItemSelection}
          onReplaceSelection={replaceSelection}
          onItemClick={handleStorageItemClick}
          onItemContextMenu={onItemContextMenu}
          onEditFile={onEditFile}
          onMoveClick={onMoveClick}
          onDelete={onDelete}
          onRenameFolder={onRenameFolder}
          onConvertFolder={onConvertFolder}
          onExtractZip={onExtractZip}
          onCancelExtractZip={onCancelExtractZip}
          getDirectoryMetadata={getDirectoryMetadata}
          getReadableExtractStatus={getReadableExtractStatus}
          getZipActionState={getZipActionState}
        />
      ) : (
        <StorageGridView
          directories={directories}
          files={contents}
          isLoading={isLoading}
          selectedItemKeys={selectedItems}
          deletingByKey={deleting}
          extractJobsByKey={extractJobs}
          thumbnailAspectRatioByKey={thumbnailAspectRatioByKey}
          onAspectRatioChange={updateThumbnailAspectRatio}
          onSelectItem={handleItemSelection}
          onReplaceSelection={replaceSelection}
          onItemClick={handleStorageItemClick}
          onItemContextMenu={onItemContextMenu}
          onEditFile={onEditFile}
          onMoveClick={onMoveClick}
          onDelete={onDelete}
          onRenameFolder={onRenameFolder}
          onConvertFolder={onConvertFolder}
          onExtractZip={onExtractZip}
          onCancelExtractZip={onCancelExtractZip}
          getDirectoryMetadata={getDirectoryMetadata}
          getReadableExtractStatus={getReadableExtractStatus}
          getZipActionState={getZipActionState}
        />
      )}

    </>
  );
}
