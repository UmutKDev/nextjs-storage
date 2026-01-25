import React from "react";
import SmartGallery from "@/components/Gallery/SmartGallery";
import { StorageGridFileCard } from "@/components/storage-browser/grid/StorageGridFileCard";
import { StorageGridFolderCard } from "@/components/storage-browser/grid/StorageGridFolderCard";
import type {
  CloudObject,
  Directory,
  StorageItemType,
  ZipExtractJobsByKey,
  ZipExtractJob,
} from "@/components/storage-browser/types/storage-browser.types";
import type { DirectoryMetadata } from "@/components/storage-browser/hooks/useDirectoryMetadata";

const DEFAULT_FILE_ASPECT_RATIO = 1.2;
const FOLDER_CARD_ASPECT_RATIO = 1;
const MIN_GALLERY_ASPECT_RATIO = 0.3;
const MAX_GALLERY_ASPECT_RATIO = 4;
const GRID_SKELETON_COUNT = 12;

type StorageGridViewProps = {
  directories?: Directory[];
  files?: CloudObject[];
  isLoading?: boolean;
  selectedItemKeys: Set<string>;
  deletingByKey?: Record<string, boolean>;
  extractJobsByKey?: ZipExtractJobsByKey;
  thumbnailAspectRatioByKey: Record<string, number>;
  onAspectRatioChange: (itemKey: string, aspectRatio: number) => void;
  onSelectItem: (itemKey: string, allowMultiple: boolean) => void;
  onItemClick: (
    item: CloudObject | Directory,
    itemType: StorageItemType,
    event: React.MouseEvent,
  ) => void;
  onEditFile?: (file: CloudObject) => void;
  onMoveClick?: (fileKeys: string[]) => void;
  onDelete?: (item: CloudObject | Directory) => void;
  onRenameFolder?: (directory: Directory) => void;
  onConvertFolder?: (directory: Directory) => void;
  onExtractZip?: (file: CloudObject) => void;
  onCancelExtractZip?: (file: CloudObject) => void;
  getDirectoryMetadata: (directory: Directory) => DirectoryMetadata;
  getReadableExtractStatus: (extractJob: ZipExtractJob) => string;
  getZipActionState: (args: {
    file?: CloudObject;
    isLoading?: boolean;
    hasExtractHandler: boolean;
    hasCancelHandler: boolean;
    extractJob?: ZipExtractJob;
  }) => { canStartExtraction: boolean; canCancelExtraction: boolean };
};

export const StorageGridView = ({
  directories,
  files,
  isLoading,
  selectedItemKeys,
  deletingByKey = {},
  extractJobsByKey = {},
  thumbnailAspectRatioByKey,
  onAspectRatioChange,
  onSelectItem,
  onItemClick,
  onEditFile,
  onMoveClick,
  onDelete,
  onRenameFolder,
  onConvertFolder,
  onExtractZip,
  onCancelExtractZip,
  getDirectoryMetadata,
  getReadableExtractStatus,
  getZipActionState,
}: StorageGridViewProps) => {
  const galleryItems: {
    key: string;
    aspectRatio: number;
    render: (box: { width: number; height: number }) => React.ReactNode;
  }[] = [];

  (directories ?? []).forEach((directory, index) => {
    const directoryKey = directory.Prefix || `dir-${index}`;
    const directoryMetadata = getDirectoryMetadata(directory);

    galleryItems.push({
      key: directoryKey,
      aspectRatio: FOLDER_CARD_ASPECT_RATIO,
      render: () => (
        <StorageGridFolderCard
          directory={directory}
          directoryKey={directoryKey}
          directoryMetadata={directoryMetadata}
          isSelected={selectedItemKeys.has(directoryKey)}
          isLoading={isLoading}
          deletingByKey={deletingByKey}
          onSelectItem={onSelectItem}
          onFolderClick={(selectedDirectory, event) =>
            onItemClick(selectedDirectory, "folder", event)
          }
          onDelete={onDelete}
          onRename={onRenameFolder}
          onConvertToEncrypted={onConvertFolder}
        />
      ),
    });
  });

  const fileItems = isLoading
    ? Array.from({ length: GRID_SKELETON_COUNT })
    : (files ?? []);

  fileItems.forEach((file, index) => {
    if (isLoading) {
      const skeletonKey = `file-skeleton-${index}`;
      galleryItems.push({
        key: skeletonKey,
        aspectRatio: DEFAULT_FILE_ASPECT_RATIO,
        render: () => (
          <div className="w-full h-full rounded-xl border bg-muted/10 p-4 flex flex-col gap-3 animate-pulse">
            <div className="flex-1 rounded-lg bg-muted/20" />
            <div className="h-4 w-2/3 rounded bg-muted/20 mx-auto" />
          </div>
        ),
      });
      return;
    }

    const fileItem = file as CloudObject;
    const fileKey = fileItem.Path?.Key ?? `file-${index}`;
    const extractJob = extractJobsByKey[fileKey];
    const { canStartExtraction, canCancelExtraction } = getZipActionState({
      file: fileItem,
      isLoading,
      hasExtractHandler: Boolean(onExtractZip),
      hasCancelHandler: Boolean(onCancelExtractZip),
      extractJob,
    });
    const extractStatusLabel = extractJob
      ? getReadableExtractStatus(extractJob)
      : undefined;
    const metadataWidth = fileItem.Metadata?.Width
      ? Number(fileItem.Metadata.Width)
      : null;
    const metadataHeight = fileItem.Metadata?.Height
      ? Number(fileItem.Metadata.Height)
      : null;
    const metadataAspectRatio =
      metadataWidth && metadataHeight && metadataHeight > 0
        ? metadataWidth / metadataHeight
        : null;
    const aspectRatio =
      thumbnailAspectRatioByKey[fileKey] ??
      (metadataAspectRatio && Number.isFinite(metadataAspectRatio)
        ? metadataAspectRatio
        : DEFAULT_FILE_ASPECT_RATIO);

    galleryItems.push({
      key: fileKey,
      aspectRatio: Math.min(
        Math.max(aspectRatio, MIN_GALLERY_ASPECT_RATIO),
        MAX_GALLERY_ASPECT_RATIO,
      ),
      render: () => (
        <StorageGridFileCard
          file={fileItem}
          fileKey={fileKey}
          isSelected={selectedItemKeys.has(fileKey)}
          isLoading={isLoading}
          deletingByKey={deletingByKey}
          extractStatusLabel={extractStatusLabel}
          canStartExtraction={canStartExtraction}
          canCancelExtraction={canCancelExtraction}
          onSelectItem={onSelectItem}
          onFileClick={(selectedFile, event) =>
            onItemClick(selectedFile, "file", event)
          }
          onEditFile={onEditFile}
          onMoveClick={onMoveClick}
          onDelete={onDelete}
          onExtractZip={onExtractZip}
          onCancelExtractZip={onCancelExtractZip}
          onAspectRatioChange={onAspectRatioChange}
        />
      ),
    });
  });

  return (
    <SmartGallery
      items={galleryItems}
      gap={8}
      targetRowHeight={320}
      tolerance={0.2}
      className="pt-1"
    />
  );
};
