"use client";

import React from "react";
import {
  Archive,
  Eye,
  FolderInput,
  Lock,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  CloudObject,
  Directory,
} from "@/components/storage-browser/types/storage-browser.types";
import { useExplorerActions } from "../../contexts/ExplorerActionsContext";
import { useExplorerContextMenu } from "../../contexts/ExplorerContextMenuContext";
import { useDirectoryMetadata } from "@/components/storage-browser/hooks/useDirectoryMetadata";
import { useZipExtractStatus } from "@/components/storage-browser/hooks/useZipExtractStatus";

type ExplorerContextMenuProps = {
  files: CloudObject[];
  directories: Directory[];
  isLoading: boolean;
};

type MenuItemProps = {
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

const MenuItem = ({ icon: Icon, disabled, onClick, children }: MenuItemProps) => (
  <button
    type="button"
    className={cn(
      "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-left",
      "hover:bg-accent hover:text-accent-foreground",
      "disabled:pointer-events-none disabled:opacity-50",
    )}
    onClick={onClick}
    disabled={disabled}
    data-dnd-ignore
  >
    {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
    <span>{children}</span>
  </button>
);

export default function ExplorerContextMenu({
  files,
  directories,
  isLoading,
}: ExplorerContextMenuProps) {
  const { contextMenuState, closeContextMenu } = useExplorerContextMenu();
  const {
    deletingStatusByKey,
    extractJobs,
    extractZip,
    cancelExtractZip,
    previewFile,
    editFile,
    moveItems,
    deleteItem,
    renameItem,
    convertFolder,
  } = useExplorerActions();
  const { getDirectoryMetadata } = useDirectoryMetadata();
  const { getZipActionState } = useZipExtractStatus();

  if (!contextMenuState) return null;

  const { key, type, x, y } = contextMenuState;
  const targetFile =
    type === "file" ? files.find((file) => file.Path?.Key === key) : undefined;
  const targetDirectory =
    type === "folder"
      ? directories.find((directory) => directory.Prefix === key)
      : undefined;

  if (type === "file" && !targetFile) return null;
  if (type === "folder" && !targetDirectory) return null;

  const directoryMetadata = targetDirectory
    ? getDirectoryMetadata(targetDirectory)
    : null;
  const zipName = (
    targetFile?.Metadata?.Originalfilename ||
    targetFile?.Name ||
    ""
  ).toLowerCase();
  const isZipFile =
    targetFile?.Extension?.toLowerCase() === "zip" || zipName.endsWith(".zip");
  const extractJob = key ? extractJobs[key] : undefined;
  const { canStartExtraction, canCancelExtraction } = getZipActionState({
    file: targetFile,
    isLoading,
    hasExtractHandler: Boolean(extractZip),
    hasCancelHandler: Boolean(cancelExtractZip),
    extractJob,
  });

  const handleAction = (action: () => void) => {
    action();
    closeContextMenu();
  };

  return (
    <div
      className="absolute z-50"
      style={{ left: x, top: y }}
      data-context-menu
      data-dnd-ignore
      onContextMenu={(event) => event.preventDefault()}
    >
      <div
        className={cn(
          "min-w-[180px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        )}
        role="menu"
      >
        {type === "file" && targetFile ? (
          <>
            <MenuItem
              icon={Eye}
              disabled={isLoading}
              onClick={() => handleAction(() => previewFile(targetFile))}
            >
              Önizle
            </MenuItem>
            <MenuItem
              icon={Pencil}
              disabled={isLoading}
              onClick={() => handleAction(() => editFile(targetFile))}
            >
              Düzenle
            </MenuItem>
            <MenuItem
              icon={FolderInput}
              disabled={isLoading}
              onClick={() => handleAction(() => moveItems([key]))}
            >
              Taşı
            </MenuItem>
            {isZipFile ? (
              <MenuItem
                icon={Archive}
                disabled={!canStartExtraction}
                onClick={() => handleAction(() => extractZip(targetFile))}
              >
                Zip çıkar
              </MenuItem>
            ) : null}
            {canCancelExtraction ? (
              <MenuItem
                icon={XCircle}
                onClick={() => handleAction(() => cancelExtractZip(targetFile))}
              >
                Çıkarmayı iptal et
              </MenuItem>
            ) : null}
            <MenuItem
              icon={Trash2}
              disabled={isLoading || Boolean(deletingStatusByKey[key])}
              onClick={() => handleAction(() => deleteItem(targetFile))}
            >
              Sil
            </MenuItem>
          </>
        ) : null}
        {type === "folder" && targetDirectory && directoryMetadata ? (
          <>
            <MenuItem
              icon={Pencil}
              disabled={isLoading}
              onClick={() => handleAction(() => renameItem(targetDirectory))}
            >
              Düzenle
            </MenuItem>
            {!directoryMetadata.isEncrypted ? (
              <MenuItem
                icon={Lock}
                disabled={isLoading}
                onClick={() => handleAction(() => convertFolder(targetDirectory))}
              >
                Şifrele
              </MenuItem>
            ) : null}
            <MenuItem
              icon={Trash2}
              disabled={isLoading || Boolean(deletingStatusByKey[key])}
              onClick={() => handleAction(() => deleteItem(targetDirectory))}
            >
              Sil
            </MenuItem>
          </>
        ) : null}
      </div>
    </div>
  );
}
