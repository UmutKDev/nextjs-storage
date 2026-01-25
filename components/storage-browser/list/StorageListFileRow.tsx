import React from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import FileIcon from "@/components/Storage/FileIcon";
import { DraggableItem } from "@/components/storage-browser/dnd/DraggableItem";
import type { CloudObject } from "@/components/storage-browser/types/storage-browser.types";
import { useExplorerSelection } from "@/features/storage-explorer/contexts/ExplorerSelectionContext";
import { useExplorerActions } from "@/features/storage-explorer/contexts/ExplorerActionsContext";
import { useStorageBrowserInteractions } from "@/components/storage-browser/contexts/StorageBrowserInteractionsContext";
import { useZipExtractStatus } from "@/components/storage-browser/hooks/useZipExtractStatus";

type StorageListFileRowProps = {
  file: CloudObject;
  fileKey: string;
};

export const StorageListFileRow = ({
  file,
  fileKey,
}: StorageListFileRowProps) => {
  const { selectedItemKeys } = useExplorerSelection();
  const { extractJobs } = useExplorerActions();
  const { handleItemClick, updateSelection, openContextMenu } =
    useStorageBrowserInteractions();
  const { getReadableExtractStatus } = useZipExtractStatus();
  const isSelected = selectedItemKeys.has(fileKey);
  const extractJob = extractJobs[fileKey];
  const extractStatusLabel = extractJob
    ? getReadableExtractStatus(extractJob)
    : undefined;
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
          className="flex items-center justify-center shrink-0"
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
            </DropdownMenu>
          </div>
        </div>
      </div>
    </DraggableItem>
  );
};
