import React from "react";
import { Folder, Lock, MoreHorizontal, Pencil, Trash2, Unlock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { DraggableItem } from "@/components/storage-browser/dnd/DraggableItem";
import { FolderThumbnail } from "@/components/storage-browser/thumbnails/FolderThumbnail";
import type {
  Directory,
} from "@/components/storage-browser/types/storage-browser.types";
import type { DirectoryMetadata } from "@/components/storage-browser/hooks/useDirectoryMetadata";

type StorageGridFolderCardProps = {
  directory: Directory;
  directoryKey: string;
  directoryMetadata: DirectoryMetadata;
  isSelected: boolean;
  isLoading?: boolean;
  deletingByKey?: Record<string, boolean>;
  onSelectItem: (itemKey: string, allowMultiple: boolean) => void;
  onFolderClick: (directory: Directory, event: React.MouseEvent) => void;
  onDelete?: (directory: Directory) => void;
  onRename?: (directory: Directory) => void;
  onConvertToEncrypted?: (directory: Directory) => void;
};

export const StorageGridFolderCard = ({
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
}: StorageGridFolderCardProps) => (
  <DraggableItem
    itemKey={directoryKey}
    itemType="folder"
    isSelected={isSelected}
    className="group h-full"
    data={directory}
  >
    <div
      className="relative w-full h-full rounded-xl border bg-card hover:bg-muted/10 cursor-pointer transition-colors overflow-hidden p-0"
      onClick={(event) => onFolderClick(directory, event)}
    >
      <div
        className="absolute top-2 left-2 z-10"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelectItem(directoryKey, true)}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
      </div>

      <div className="h-full p-2 md:p-3 flex flex-col items-center justify-center gap-2">
        <FolderThumbnail directory={directory} className="mb-1 md:mb-2" />
        <div className="text-xs md:text-sm font-medium text-center truncate w-full px-1 md:px-2">
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
    </div>
  </DraggableItem>
);
