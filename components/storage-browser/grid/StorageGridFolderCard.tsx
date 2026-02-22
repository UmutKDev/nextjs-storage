import React from "react";
import { Lock, MoreHorizontal, Pencil, Trash2, Unlock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { DraggableItem } from "@/components/storage-browser/dnd/DraggableItem";
import { FolderThumbnail } from "@/components/storage-browser/thumbnails/FolderThumbnail";
import type { Directory } from "@/components/storage-browser/types/storage-browser.types";
import { useDirectoryMetadata } from "@/components/storage-browser/hooks/useDirectoryMetadata";
import { useExplorerSelection } from "@/features/storage-explorer/contexts/ExplorerSelectionContext";
import { useStorageBrowserInteractions } from "@/components/storage-browser/contexts/StorageBrowserInteractionsContext";
import { useExplorerActions } from "@/features/storage-explorer/contexts/ExplorerActionsContext";

type StorageGridFolderCardProps = {
  directory: Directory;
  directoryKey: string;
};

export const StorageGridFolderCard = ({
  directory,
  directoryKey,
}: StorageGridFolderCardProps) => {
  const { selectedItemKeys } = useExplorerSelection();
  const { getDirectoryMetadata } = useDirectoryMetadata();
  const { handleItemClick, handleItemAuxClick, updateSelection, openContextMenu, isLoading } =
    useStorageBrowserInteractions();
  const { deletingStatusByKey, renameItem, convertFolder, deleteItem } =
    useExplorerActions();
  const directoryMetadata = getDirectoryMetadata(directory);
  const isSelected = selectedItemKeys.has(directoryKey);
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
        openContextMenu(directory, "folder", { x: clientX, y: clientY });
      }, 550);
    },
    [directory, openContextMenu],
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
      className="group h-full"
      data={directory}
    >
      <div
        className={cn(
          "relative w-full h-full rounded-2xl border bg-card/80 hover:bg-muted/10 cursor-pointer overflow-hidden p-2",
          "transition-all duration-200 shadow-sm hover:-translate-y-1 hover:shadow-lg",
          isSelected && "ring-2 ring-primary/60 border-primary/40",
        )}
        onClick={(event) => {
          if (longPressTriggeredRef.current) {
            longPressTriggeredRef.current = false;
            return;
          }
          handleItemClick(directory, "folder", event);
        }}
        onAuxClick={(event) => handleItemAuxClick(directory, "folder", event)}
        onContextMenu={(event) => {
          event.preventDefault();
          openContextMenu(directory, "folder", {
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
              updateSelection(directoryKey, {
                allowMultiple: true,
                rangeSelect: event.shiftKey,
              })
            }
            className="size-6 bg-background/90 backdrop-blur"
            aria-label={`${directoryMetadata.displayName} klasorunu sec`}
          />
        </div>

        <div className="h-full flex flex-col gap-2">
          <div className="relative flex-1 rounded-xl overflow-hidden bg-muted/10">
            <FolderThumbnail directory={directory} className="h-full w-full" />
          </div>
          <div className="min-h-[2.75rem] px-1 pb-1 flex flex-col gap-1">
            <div className="text-xs md:text-sm font-medium leading-snug text-left truncate">
              {directoryMetadata.displayName}
            </div>
            <div className="text-[10px] md:text-xs text-muted-foreground">
              {directoryMetadata.isEncrypted ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full font-medium",
                    directoryMetadata.isUnlocked
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700",
                  )}
                >
                  {directoryMetadata.isUnlocked ? (
                    <Unlock className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  ) : (
                    <Lock className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  )}
                  {directoryMetadata.isUnlocked ? "Kilitsiz" : "Şifreli"}
                </span>
              ) : (
                "Klasör"
              )}
            </div>
          </div>
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
                  if (!isLoading) renameItem(directory);
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!isLoading) renameItem(directory);
                }}
                data-dnd-ignore
              >
                <Pencil className="mr-2 h-4 w-4" />
                Düzenle
              </DropdownMenuItem>
              {!directoryMetadata.isEncrypted ? (
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.stopPropagation();
                    if (!isLoading) convertFolder(directory);
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!isLoading) convertFolder(directory);
                  }}
                  data-dnd-ignore
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Şifrele
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                onSelect={(event) => {
                  event.stopPropagation();
                  if (!isLoading) deleteItem(directory);
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!isLoading) deleteItem(directory);
                }}
                disabled={
                  isLoading || Boolean(deletingStatusByKey[directoryKey])
                }
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
