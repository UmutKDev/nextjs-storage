import React from "react";
import SmartGallery from "@/components/Gallery/SmartGallery";
import { StorageGridFileCard } from "@/components/storage-browser/grid/StorageGridFileCard";
import { StorageGridFolderCard } from "@/components/storage-browser/grid/StorageGridFolderCard";
import { useThumbnailAspectRatio } from "@/components/storage-browser/hooks/useThumbnailAspectRatio";
import { StorageGridThumbnailProvider } from "@/components/storage-browser/contexts/StorageGridThumbnailContext";
import { useStorageBrowserInteractions } from "@/components/storage-browser/contexts/StorageBrowserInteractionsContext";
import { useExplorerSelection } from "@/features/storage-explorer/contexts/ExplorerSelectionContext";
import { useExplorerContextMenuStore } from "@/features/storage-explorer/stores/explorerContextMenu.store";
import type {
  CloudObject,
  Directory,
} from "@/components/storage-browser/types/storage-browser.types";

const DEFAULT_FILE_ASPECT_RATIO = 1.2;
const FOLDER_CARD_ASPECT_RATIO = 1;
const MIN_GALLERY_ASPECT_RATIO = 0.5;
const MAX_GALLERY_ASPECT_RATIO = 4;
const GRID_SKELETON_COUNT = 12;

type StorageGridViewProps = {
  directories?: Directory[];
  files?: CloudObject[];
};

export const StorageGridView = ({
  directories,
  files,
}: StorageGridViewProps) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const containerRectRef = React.useRef<DOMRect | null>(null);
  const pointerStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const { thumbnailAspectRatioByKey, updateThumbnailAspectRatio } =
    useThumbnailAspectRatio();
  const { isLoading, replaceSelection } = useStorageBrowserInteractions();
  const { selectedItemKeys } = useExplorerSelection();
  const scrollContainerRef = useExplorerContextMenuStore(
    (state) => state.scrollContainerRef,
  );
  const [galleryMetrics, setGalleryMetrics] = React.useState({
    rowHeight: 420,
    gap: 12,
    maxItemsPerRow: 4,
  });
  const [selectionBox, setSelectionBox] = React.useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const [selectionContainerOffset, setSelectionContainerOffset] =
    React.useState<{
      left: number;
      top: number;
    } | null>(null);

  const galleryItems: {
    key: string;
    aspectRatio: number;
    render: (box: { width: number; height: number }) => React.ReactNode;
  }[] = [];

  (directories ?? []).forEach((directory, index) => {
    const directoryKey = directory.Prefix || `dir-${index}`;

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
          <div className="w-full h-full rounded-2xl border bg-muted/10 p-4 flex flex-col gap-3 animate-pulse">
            <div className="flex-1 rounded-xl bg-muted/20" />
            <div className="h-4 w-2/3 rounded bg-muted/20 mx-auto" />
          </div>
        ),
      });
      return;
    }

    const fileItem = file as CloudObject;
    const fileKey = fileItem.Path?.Key ?? `file-${index}`;
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
          <StorageGridFileCard file={fileItem} fileKey={fileKey} />
        </div>
      ),
    });
  });

  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateMetrics = (width: number) => {
      const next =
        width < 640
          ? { rowHeight: 260, gap: 10, maxItemsPerRow: 2 }
          : width < 1100
            ? { rowHeight: 320, gap: 12, maxItemsPerRow: 3 }
            : { rowHeight: 400, gap: 14, maxItemsPerRow: 4 };
      setGalleryMetrics((previous) =>
        previous.rowHeight === next.rowHeight &&
        previous.gap === next.gap &&
        previous.maxItemsPerRow === next.maxItemsPerRow
          ? previous
          : next,
      );
    };

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      updateMetrics(entry.contentRect.width);
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        const targetNode = event.target as Node | null;
        const targetElement =
          targetNode instanceof Element
            ? targetNode
            : (targetNode?.parentElement ?? null);
        if (
          targetElement?.closest(
            "[data-slot='dropdown-menu-content'], [data-slot='dropdown-menu-item'], [data-slot='dropdown-menu-trigger'], [role='menuitem'], [data-context-menu], [data-dnd-ignore]",
          )
        ) {
          return;
        }
        if (!containerRef.current) return;
        if (
          (event.target as HTMLElement | null)?.closest(
            "[data-selectable-item]",
          )
        ) {
          return;
        }
        containerRectRef.current = containerRef.current.getBoundingClientRect();
        setSelectionContainerOffset({
          left: containerRectRef.current.left,
          top: containerRectRef.current.top,
        });
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

        const nextKeys = new Set<string>();
        const container = containerRef.current;
        if (!container) return;
        const items = container.querySelectorAll<HTMLElement>(
          "[data-selectable-item]",
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

        const shouldMerge = event.shiftKey || event.metaKey || event.ctrlKey;
        if (shouldMerge) {
          selectedItemKeys.forEach((key) => nextKeys.add(key));
        }
        replaceSelection(nextKeys);
      }}
      onPointerUp={(event) => {
        if (!pointerStartRef.current) return;
        pointerStartRef.current = null;
        setSelectionBox(null);
        containerRectRef.current = null;
        setSelectionContainerOffset(null);
        containerRef.current?.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={(event) => {
        pointerStartRef.current = null;
        setSelectionBox(null);
        containerRectRef.current = null;
        setSelectionContainerOffset(null);
        containerRef.current?.releasePointerCapture(event.pointerId);
      }}
    >
      <StorageGridThumbnailProvider
        thumbnailAspectRatioByKey={thumbnailAspectRatioByKey}
        onAspectRatioChange={updateThumbnailAspectRatio}
      >
        <SmartGallery
          items={galleryItems}
          gap={galleryMetrics.gap}
          targetRowHeight={galleryMetrics.rowHeight}
          maxItemsPerRow={galleryMetrics.maxItemsPerRow}
          tolerance={0.2}
          className="pt-2 pb-3"
          scrollElementRef={scrollContainerRef}
        />
      </StorageGridThumbnailProvider>
      <div
        className="w-full"
        style={{ height: Math.round(galleryMetrics.rowHeight * 0.3) }}
        aria-hidden
      />
      {selectionBox && selectionContainerOffset ? (
        <div
          className="pointer-events-none absolute z-20 border border-primary/60 bg-primary/10 backdrop-blur-[1px]"
          style={{
            left: selectionBox.left - selectionContainerOffset.left,
            top: selectionBox.top - selectionContainerOffset.top,
            width: selectionBox.width,
            height: selectionBox.height,
          }}
        />
      ) : null}
    </div>
  );
};
