import React from "react";
import { Folder, Lock, MoreHorizontal, Pencil, Trash2, Unlock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { DraggableItem } from "@/components/storage-browser/dnd/DraggableItem";
import type {
  Directory,
} from "@/components/storage-browser/types/storage-browser.types";
import type { DirectoryMetadata } from "@/components/storage-browser/hooks/useDirectoryMetadata";

type StorageListFolderRowProps = {
  directory: Directory;
  directoryKey: string;
  directoryMetadata: DirectoryMetadata;
  isSelected: boolean;
  isLoading?: boolean;
  deletingByKey?: Record<string, boolean>;
  onSelectItem: (
    itemKey: string,
    options?: { allowMultiple?: boolean; rangeSelect?: boolean },
  ) => void;
  onFolderClick: (directory: Directory, event: React.MouseEvent) => void;
  onContextMenu?: (point: { x: number; y: number }) => void;
  onDelete?: (directory: Directory) => void;
  onRename?: (directory: Directory) => void;
  onConvertToEncrypted?: (directory: Directory) => void;
};

export const StorageListFolderRow = ({
  directory,
  directoryKey,
  directoryMetadata,
  isSelected,
  isLoading,
  deletingByKey = {},
  onSelectItem,
  onFolderClick,
  onDelete,
  onRename,
  onConvertToEncrypted,
  onContextMenu,
}: StorageListFolderRowProps) => {
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
      itemKey={directoryKey}
      itemType="folder"
      isSelected={isSelected}
      className="group"
      data={directory}
    >
      <div
        className="flex items-center gap-2 md:gap-4 px-2 md:px-4 py-3 hover:bg-muted/10 cursor-pointer active:bg-muted/20"
        onClick={(event) => {
          if (longPressTriggeredRef.current) {
            longPressTriggeredRef.current = false;
            return;
          }
          onFolderClick(directory, event);
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
              onSelectItem(directoryKey, {
                allowMultiple: true,
                rangeSelect: event.shiftKey,
              })
            }
            className="size-6 md:size-6 bg-background/90"
            aria-label={`${directoryMetadata.displayName} klasorunu sec`}
          />
        </div>
      <div className="w-8 h-8 md:w-8 md:h-8 flex items-center justify-center rounded-md bg-blue-500/10 text-blue-500 shrink-0">
        <Folder size={18} fill="currentColor" className="opacity-80" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">
          {directoryMetadata.displayName}
        </div>
        {directoryMetadata.isEncrypted ? (
          <div
            className={cn(
              "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium sm:hidden",
              directoryMetadata.isUnlocked
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700",
            )}
          >
            {directoryMetadata.isUnlocked ? (
              <Unlock className="h-3 w-3" />
            ) : (
              <Lock className="h-3 w-3" />
            )}
            {directoryMetadata.isUnlocked ? "Kilitsiz" : "Şifreli"}
          </div>
        ) : null}
      </div>
      <div className="text-xs text-muted-foreground hidden sm:block">
        {directoryMetadata.isEncrypted ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 font-medium",
              directoryMetadata.isUnlocked
                ? "text-emerald-600"
                : "text-amber-600",
            )}
          >
            {directoryMetadata.isUnlocked ? (
              <Unlock className="h-3.5 w-3.5" />
            ) : (
              <Lock className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {directoryMetadata.isUnlocked ? "Kilitsiz" : "Şifreli"}
            </span>
          </span>
        ) : (
          <span className="hidden sm:inline">Klasör</span>
        )}
      </div>

      <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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
            {onRename ? (
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  if (!isLoading) onRename(directory);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Düzenle
              </DropdownMenuItem>
            ) : null}
            {!directoryMetadata.isEncrypted && onConvertToEncrypted ? (
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  if (!isLoading) onConvertToEncrypted(directory);
                }}
              >
                <Lock className="mr-2 h-4 w-4" />
                Şifrele
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                if (!isLoading && onDelete) onDelete(directory);
              }}
              disabled={isLoading || Boolean(deletingByKey[directoryKey])}
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
