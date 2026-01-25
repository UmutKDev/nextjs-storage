import React from "react";
import {
  Archive,
  Eye,
  FolderInput,
  MoreHorizontal,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { DraggableItem } from "@/components/storage-browser/dnd/DraggableItem";
import { GridThumbnail } from "@/components/storage-browser/thumbnails/GridThumbnail";
import { cn } from "@/lib/utils";
import type { CloudObject } from "@/components/storage-browser/types/storage-browser.types";
import { useExplorerSelection } from "@/features/storage-explorer/contexts/ExplorerSelectionContext";
import { useExplorerActions } from "@/features/storage-explorer/contexts/ExplorerActionsContext";
import { useStorageBrowserInteractions } from "@/components/storage-browser/contexts/StorageBrowserInteractionsContext";
import { useStorageGridThumbnailContext } from "@/components/storage-browser/contexts/StorageGridThumbnailContext";
import { useZipExtractStatus } from "@/components/storage-browser/hooks/useZipExtractStatus";

type StorageGridFileCardProps = {
  file: CloudObject;
  fileKey: string;
};

export const StorageGridFileCard = ({
  file,
  fileKey,
}: StorageGridFileCardProps) => {
  const { selectedItemKeys } = useExplorerSelection();
  const {
    deletingStatusByKey,
    extractJobs,
    extractZip,
    cancelExtractZip,
    previewFile,
    editFile,
    moveItems,
    deleteItem,
  } = useExplorerActions();
  const { handleItemClick, updateSelection, openContextMenu, isLoading } =
    useStorageBrowserInteractions();
  const { onAspectRatioChange } = useStorageGridThumbnailContext();
  const { getReadableExtractStatus, getZipActionState } =
    useZipExtractStatus();
  const extractJob = extractJobs[fileKey];
  const extractStatusLabel = extractJob
    ? getReadableExtractStatus(extractJob)
    : undefined;
  const isSelected = selectedItemKeys.has(fileKey);
  const zipName = (
    file.Metadata?.Originalfilename ||
    file.Name ||
    ""
  ).toLowerCase();
  const isZipFile =
    file.Extension?.toLowerCase() === "zip" || zipName.endsWith(".zip");
  const { canStartExtraction, canCancelExtraction } = getZipActionState({
    file,
    isLoading,
    hasExtractHandler: Boolean(extractZip),
    hasCancelHandler: Boolean(cancelExtractZip),
    extractJob,
  });
  const longPressTimerRef = React.useRef<number | null>(null);
  const longPressTriggeredRef = React.useRef(false);
  const pointerStartRef = React.useRef<{ x: number; y: number } | null>(null);

  const clearLongPress = React.useCallback(() => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "touch") return;
      const { clientX, clientY } = event;
      pointerStartRef.current = { x: clientX, y: clientY };
      longPressTriggeredRef.current = false;
      longPressTimerRef.current = window.setTimeout(() => {
        longPressTriggeredRef.current = true;
        openContextMenu(file, "file", { x: clientX, y: clientY });
      }, 550);
    },
    [file, openContextMenu],
  );

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!pointerStartRef.current) return;
      const deltaX = Math.abs(event.clientX - pointerStartRef.current.x);
      const deltaY = Math.abs(event.clientY - pointerStartRef.current.y);
      if (deltaX > 6 || deltaY > 6) {
        clearLongPress();
        pointerStartRef.current = null;
      }
    },
    [clearLongPress],
  );

  const handlePointerUp = React.useCallback(() => {
    clearLongPress();
    pointerStartRef.current = null;
  }, [clearLongPress]);

  return (
    <DraggableItem
      itemKey={fileKey}
      itemType="file"
      isSelected={isSelected}
      className="group h-full"
      data={file}
    >
      <div
        className={cn(
          "relative w-full h-full rounded-2xl border bg-card/80 hover:bg-muted/10 cursor-pointer overflow-hidden transition-all duration-200",
          "shadow-sm hover:-translate-y-1 hover:shadow-lg",
          isSelected && "ring-2 ring-primary/60 border-primary/40",
        )}
        onClick={(event) => {
          if (longPressTriggeredRef.current) {
            longPressTriggeredRef.current = false;
            return;
          }
          handleItemClick(file, "file", event);
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          openContextMenu(file, "file", {
            x: event.clientX,
            y: event.clientY,
          });
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="absolute top-2 left-2 z-10"
          onClick={(event) => event.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onClick={(event) =>
              updateSelection(fileKey, {
                allowMultiple: true,
                rangeSelect: event.shiftKey,
              })
            }
            className="size-6 bg-background/90 backdrop-blur"
            aria-label={`${file.Name} sec`}
          />
        </div>

        <div className="w-full h-full overflow-hidden rounded-xl bg-muted/5 relative">
          <GridThumbnail
            file={file}
            onAspectRatioChange={(ratio) => onAspectRatioChange(fileKey, ratio)}
          />

          <div className="absolute left-0 right-0 bottom-0 px-3 py-2 bg-gradient-to-t from-black/70 via-black/30 to-transparent text-white text-xs flex items-center justify-between gap-2">
            <div
              className="truncate font-medium drop-shadow-sm"
              title={file.Name}
            >
              {file.Name}
            </div>
          </div>

          {extractStatusLabel ? (
            <div className="absolute left-2 bottom-2 right-2 text-[10px] text-white/90 bg-black/50 rounded-md px-2 py-1 truncate">
              {extractStatusLabel}
            </div>
          ) : null}
        </div>

        <div className="absolute top-2 right-2 flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(event) => event.stopPropagation()}
                className="rounded-full p-1.5 bg-background/80 hover:bg-muted shadow-sm border backdrop-blur"
                data-dnd-ignore
              >
                <MoreHorizontal size={16} className="text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={(event) => {
                  event.stopPropagation();
                  if (!isLoading) previewFile(file);
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!isLoading) previewFile(file);
                }}
                data-dnd-ignore
              >
                <Eye className="mr-2 h-4 w-4" />
                Önizle
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.stopPropagation();
                  if (!isLoading) editFile(file);
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!isLoading) editFile(file);
                }}
                data-dnd-ignore
              >
                <Pencil className="mr-2 h-4 w-4" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.stopPropagation();
                  if (!isLoading) moveItems([fileKey]);
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!isLoading) moveItems([fileKey]);
                }}
                data-dnd-ignore
              >
                <FolderInput className="mr-2 h-4 w-4" />
                Taşı
              </DropdownMenuItem>
              {isZipFile ? (
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.stopPropagation();
                    if (canStartExtraction) extractZip(file);
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (canStartExtraction) extractZip(file);
                  }}
                  disabled={!canStartExtraction}
                  data-dnd-ignore
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Zip çıkar
                </DropdownMenuItem>
              ) : null}
              {canCancelExtraction ? (
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.stopPropagation();
                    cancelExtractZip(file);
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    cancelExtractZip(file);
                  }}
                  data-dnd-ignore
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Çıkarmayı iptal et
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                onSelect={(event) => {
                  event.stopPropagation();
                  if (!isLoading) deleteItem(file);
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!isLoading) deleteItem(file);
                }}
                disabled={isLoading || Boolean(deletingStatusByKey[fileKey])}
                data-dnd-ignore
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </DraggableItem>
  );
};
