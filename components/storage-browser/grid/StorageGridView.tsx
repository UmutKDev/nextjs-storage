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
  onSelectItem: (
    itemKey: string,
    options?: { allowMultiple?: boolean; rangeSelect?: boolean },
  ) => void;
  onReplaceSelection?: (nextSelection: Set<string>) => void;
  onItemClick: (
    item: CloudObject | Directory,
    itemType: StorageItemType,
    event: React.MouseEvent,
  ) => void;
  onItemContextMenu?: (
    item: CloudObject | Directory,
    itemType: StorageItemType,
    point: { x: number; y: number },
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
  onItemContextMenu,
}: StorageGridViewProps) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const containerRectRef = React.useRef<DOMRect | null>(null);
  const pointerStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const [selectionBox, setSelectionBox] = React.useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

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
        <div
          data-selectable-item
          data-item-key={directoryKey}
          className="h-full"
        >
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
            onContextMenu={
              onItemContextMenu
                ? (point) => onItemContextMenu(directory, "folder", point)
                : undefined
            }
            onDelete={onDelete}
            onRename={onRenameFolder}
            onConvertToEncrypted={onConvertFolder}
          />
        </div>
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
        <div data-selectable-item data-item-key={fileKey} className="h-full">
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
            onContextMenu={
              onItemContextMenu
                ? (point) => onItemContextMenu(fileItem, "file", point)
                : undefined
            }
            onEditFile={onEditFile}
            onMoveClick={onMoveClick}
            onDelete={onDelete}
            onExtractZip={onExtractZip}
            onCancelExtractZip={onCancelExtractZip}
            onAspectRatioChange={onAspectRatioChange}
          />
        </div>
      ),
    });
  });

  return (
    <div
      ref={containerRef}
      className="relative"
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        if (!containerRef.current) return;
        if ((event.target as HTMLElement | null)?.closest("[data-selectable-item]")) {
          return;
        }
        containerRectRef.current =
          containerRef.current.getBoundingClientRect();
        pointerStartRef.current = {
          x: event.clientX,
          y: event.clientY,
        };
        setSelectionBox({
          left: event.clientX,
          top: event.clientY,
          width: 0,
          height: 0,
        });
        containerRef.current.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!pointerStartRef.current || !containerRectRef.current) return;
        const start = pointerStartRef.current;
        const left = Math.min(start.x, event.clientX);
        const top = Math.min(start.y, event.clientY);
        const right = Math.max(start.x, event.clientX);
        const bottom = Math.max(start.y, event.clientY);
        const width = right - left;
        const height = bottom - top;
        setSelectionBox({ left, top, width, height });

        if (!onReplaceSelection) return;
        const nextKeys = new Set<string>();
        const container = containerRef.current;
        if (!container) return;
        const items = container.querySelectorAll<HTMLElement>(
          "[data-selectable-item]"
        );
        items.forEach((item) => {
          const key = item.dataset.itemKey;
          if (!key) return;
          const rect = item.getBoundingClientRect();
          const intersects =
            rect.left < right &&
            rect.right > left &&
            rect.top < bottom &&
            rect.bottom > top;
          if (intersects) nextKeys.add(key);
        });

        const shouldMerge =
          event.shiftKey || event.metaKey || event.ctrlKey;
        if (shouldMerge) {
          selectedItemKeys.forEach((key) => nextKeys.add(key));
        }
        onReplaceSelection(nextKeys);
      }}
      onPointerUp={(event) => {
        if (!pointerStartRef.current) return;
        pointerStartRef.current = null;
        setSelectionBox(null);
        containerRectRef.current = null;
        containerRef.current?.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={(event) => {
        pointerStartRef.current = null;
        setSelectionBox(null);
        containerRectRef.current = null;
        containerRef.current?.releasePointerCapture(event.pointerId);
      }}
    >
      <SmartGallery
        items={galleryItems}
        gap={8}
        targetRowHeight={320}
        tolerance={0.2}
        className="pt-1"
      />
      {selectionBox && containerRectRef.current ? (
        <div
          className="pointer-events-none absolute z-20 border border-primary/60 bg-primary/10"
          style={{
            left: selectionBox.left - containerRectRef.current.left,
            top: selectionBox.top - containerRectRef.current.top,
            width: selectionBox.width,
            height: selectionBox.height,
          }}
        />
      ) : null}
    </div>
  );
};
