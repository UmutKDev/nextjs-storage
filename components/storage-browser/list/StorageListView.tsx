import React from "react";
import { StorageListFileRow } from "@/components/storage-browser/list/StorageListFileRow";
import { StorageListFolderRow } from "@/components/storage-browser/list/StorageListFolderRow";
import type {
  CloudObject,
  Directory,
  StorageItemType,
  ZipExtractJobsByKey,
  ZipExtractJob,
} from "@/components/storage-browser/types/storage-browser.types";
import type { DirectoryMetadata } from "@/components/storage-browser/hooks/useDirectoryMetadata";

type StorageListViewProps = {
  directories?: Directory[];
  files?: CloudObject[];
  isLoading?: boolean;
  selectedItemKeys: Set<string>;
  deletingByKey?: Record<string, boolean>;
  extractJobsByKey?: ZipExtractJobsByKey;
  onSelectItem: (itemKey: string, allowMultiple: boolean) => void;
  onItemClick: (
    item: CloudObject | Directory,
    itemType: StorageItemType,
    event: React.MouseEvent,
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

export const StorageListView = ({
  directories,
  files,
  isLoading,
  selectedItemKeys,
  deletingByKey = {},
  extractJobsByKey = {},
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
}: StorageListViewProps) => (
  <div className="divide-y rounded-md border bg-background/50">
    {(directories ?? []).map((directory, index) => {
      const directoryKey = directory.Prefix || `dir-${index}`;
      const directoryMetadata = getDirectoryMetadata(directory);

      return (
        <StorageListFolderRow
          key={directoryKey}
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
          onDelete={onDelete}
          onRename={onRenameFolder}
          onConvertToEncrypted={onConvertFolder}
        />
      );
    })}

    {(isLoading ? Array.from({ length: 4 }) : (files ?? [])).map(
      (file, index) => {
        if (isLoading) {
          return (
            <div key={index} className="flex items-center gap-4 px-4 py-3">
              <div className="h-8 w-8 rounded bg-muted/30 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-muted/30 animate-pulse" />
                <div className="h-3 w-1/4 rounded bg-muted/30 animate-pulse" />
              </div>
            </div>
          );
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

        return (
          <StorageListFileRow
            key={fileKey}
            file={fileItem}
            fileKey={fileKey}
            isSelected={selectedItemKeys.has(fileKey)}
            isLoading={isLoading}
            extractStatusLabel={extractStatusLabel}
            canStartExtraction={canStartExtraction}
            canCancelExtraction={canCancelExtraction}
            onSelectItem={onSelectItem}
            onFileClick={(selectedFile, event) =>
              onItemClick(selectedFile, "file", event)
            }
            onEditFile={onEditFile}
            onMoveClick={onMoveClick}
            onDelete={onDelete}
            onExtractZip={onExtractZip}
            onCancelExtractZip={onCancelExtractZip}
          />
        );
      },
    )}
  </div>
);
