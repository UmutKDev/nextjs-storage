import React from "react";
import {
  Archive,
  FolderInput,
  MoreHorizontal,
  Pencil,
  Trash2,
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
import type {
  CloudObject,
} from "@/components/storage-browser/types/storage-browser.types";

type StorageGridFileCardProps = {
  file: CloudObject;
  fileKey: string;
  isSelected: boolean;
  isLoading?: boolean;
  deletingByKey?: Record<string, boolean>;
  extractStatusLabel?: string;
  canStartExtraction: boolean;
  canCancelExtraction: boolean;
  onSelectItem: (
    itemKey: string,
    options?: { allowMultiple?: boolean; rangeSelect?: boolean },
  ) => void;
  onFileClick: (file: CloudObject, event: React.MouseEvent) => void;
  onContextMenu?: (point: { x: number; y: number }) => void;
  onEditFile?: (file: CloudObject) => void;
  onMoveClick?: (fileKeys: string[]) => void;
  onDelete?: (file: CloudObject) => void;
  onExtractZip?: (file: CloudObject) => void;
  onCancelExtractZip?: (file: CloudObject) => void;
  onAspectRatioChange: (itemKey: string, aspectRatio: number) => void;
};

export const StorageGridFileCard = ({
  file,
  fileKey,
  isSelected,
  isLoading,
  deletingByKey = {},
  extractStatusLabel,
  canStartExtraction,
  canCancelExtraction,
  onSelectItem,
  onFileClick,
  onEditFile,
  onMoveClick,
  onDelete,
  onExtractZip,
  onCancelExtractZip,
  onAspectRatioChange,
  onContextMenu,
}: StorageGridFileCardProps) => {
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
      if (event.pointerType !== "touch" || !onContextMenu) return;
      const { clientX, clientY } = event;
      pointerStartRef.current = { x: clientX, y: clientY };
      longPressTriggeredRef.current = false;
      longPressTimerRef.current = window.setTimeout(() => {
        longPressTriggeredRef.current = true;
        onContextMenu({ x: clientX, y: clientY });
      }, 550);
    },
    [onContextMenu],
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
        className="relative w-full h-full rounded-xl border bg-card hover:bg-muted/10 cursor-pointer transition-colors overflow-hidden"
        onClick={(event) => {
          if (longPressTriggeredRef.current) {
            longPressTriggeredRef.current = false;
            return;
          }
          onFileClick(file, event);
        }}
        onContextMenu={(event) => {
          if (!onContextMenu) return;
          event.preventDefault();
          onContextMenu({ x: event.clientX, y: event.clientY });
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
              onSelectItem(fileKey, {
                allowMultiple: true,
                rangeSelect: event.shiftKey,
              })
            }
            className="size-6 bg-background/90"
            aria-label={`${file.Name} sec`}
          />
        </div>

        <div className="w-full h-full overflow-hidden rounded-lg bg-muted/5 relative">
          <GridThumbnail
            file={file}
            onAspectRatioChange={(ratio) => onAspectRatioChange(fileKey, ratio)}
          />

          <div className="absolute left-0 right-0 bottom-0 px-3 py-2 bg-linear-to-t from-black/60 to-transparent text-white text-xs flex items-center justify-between gap-2">
            <div className="truncate font-medium" title={file.Name}>
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
                className="rounded-full p-1.5 bg-background/80 hover:bg-muted shadow-sm border"
              >
                <MoreHorizontal size={16} className="text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  if (!isLoading && onEditFile) onEditFile(file);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  if (!isLoading && file.Path?.Key && onMoveClick)
                    onMoveClick([file.Path.Key]);
                }}
              >
                <FolderInput className="mr-2 h-4 w-4" />
                Move
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  if (!isLoading && onDelete) onDelete(file);
                }}
                disabled={
                  isLoading || Boolean(deletingByKey[file.Path?.Key ?? ""])
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
              {canStartExtraction ? (
                <DropdownMenuItem
                  onClick={(event) => {
                    event.stopPropagation();
                    if (onExtractZip) onExtractZip(file);
                  }}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Extract zip
                </DropdownMenuItem>
              ) : null}
              {canCancelExtraction ? (
                <DropdownMenuItem
                  onClick={(event) => {
                    event.stopPropagation();
                    onCancelExtractZip?.(file);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Cancel extract
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </DraggableItem>
  );
};
