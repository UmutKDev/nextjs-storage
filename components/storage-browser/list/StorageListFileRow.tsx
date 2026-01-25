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
import FileIcon from "@/components/Storage/FileIcon";
import { DraggableItem } from "@/components/storage-browser/dnd/DraggableItem";
import type {
  CloudObject,
} from "@/components/storage-browser/types/storage-browser.types";

type StorageListFileRowProps = {
  file: CloudObject;
  fileKey: string;
  isSelected: boolean;
  isLoading?: boolean;
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
};

export const StorageListFileRow = ({
  file,
  fileKey,
  isSelected,
  isLoading,
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
  onContextMenu,
}: StorageListFileRowProps) => {
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
      className="group"
      data={file}
    >
      <div
        className="flex items-center gap-2 md:gap-4 px-2 md:px-4 py-3 hover:bg-muted/10 cursor-pointer active:bg-muted/20"
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
          className="flex items-center justify-center shrink-0"
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
            className="size-6 md:size-6 bg-background/90"
            aria-label={`${file.Metadata?.Originalfilename || file.Name} sec`}
          />
        </div>
      <div className="w-8 h-8 md:w-8 md:h-8 flex items-center justify-center rounded-md bg-muted/20 shrink-0">
        <FileIcon extension={file.Extension} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground truncate">
          <span className="truncate">
            {file.Metadata?.Originalfilename || file.Name}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            .{file.Extension}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-1 truncate">
          {file.MimeType ?? "—"}
        </div>
        {extractStatusLabel ? (
          <div className="text-[11px] text-muted-foreground mt-1 truncate">
            {extractStatusLabel}
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-2 md:gap-4 text-sm text-muted-foreground shrink-0">
        <div className="whitespace-nowrap hidden lg:block">
          {file.LastModified
            ? new Date(file.LastModified).toLocaleString()
            : "—"}
        </div>
        <div className="flex items-center gap-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(event) => event.stopPropagation()}
                className="rounded p-2 md:p-1 hover:bg-muted/10 active:bg-muted/20"
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
      </div>
    </DraggableItem>
  );
};
