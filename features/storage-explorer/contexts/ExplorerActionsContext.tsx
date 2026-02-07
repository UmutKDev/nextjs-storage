"use client";

import React from "react";
import type { CloudObjectModel } from "@/Service/Generates/api";
import type {
  CloudObject,
  Directory,
  ZipExtractJobsByKey,
} from "@/components/storage-browser/types/storage-browser.types";
import { useDialogs } from "./DialogsContext";
import { useExplorerDelete } from "../hooks/useExplorerDelete";
import { useExplorerExtractZip } from "../hooks/useExplorerExtractZip";
import { useExplorerItemNavigation } from "./ExplorerNavigationContext";

type ExplorerActionsContextValue = {
  deleteItem: (item: CloudObject | Directory) => void;
  deleteSelection: (count: number) => void;
  moveItems: (items: string[]) => void;
  renameItem: (item: CloudObject | Directory) => void;
  convertFolder: (directory: Directory) => void;
  extractZip: (file: CloudObject) => void;
  extractZipSelection: (files: CloudObject[]) => void;
  cancelExtractZip: (file: CloudObject) => void;
  createZipExtractionJob: (file: CloudObjectModel) => Promise<void>;
  previewFile: (file: CloudObject) => void;
  editFile: (file: CloudObject) => void;
  deletingStatusByKey: Record<string, boolean>;
  extractJobs: ZipExtractJobsByKey;
};

const ExplorerActionsContext =
  React.createContext<ExplorerActionsContextValue | null>(null);

export function ExplorerActionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { openDialog } = useDialogs();
  const { deletingStatusByKey } = useExplorerDelete();
  const { extractJobs, createZipExtractionJob, deleteZipExtractionJob } = useExplorerExtractZip();
  const { renameItem } = useExplorerItemNavigation();

  const deleteItem = React.useCallback(
    (item: CloudObject | Directory) => {
      openDialog("delete-item", { item });
    },
    [openDialog]
  );

  const deleteSelection = React.useCallback(
    (count: number) => {
      openDialog("delete-selection", { count });
    },
    [openDialog]
  );

  const moveItems = React.useCallback(
    (items: string[]) => {
      openDialog("move-items", { items });
    },
    [openDialog]
  );

  const convertFolder = React.useCallback(
    (directory: Directory) => {
      openDialog("convert-folder", { directory });
    },
    [openDialog]
  );

  const extractZip = React.useCallback(
    (file: CloudObject) => {
      openDialog("extract-zip", { file });
    },
    [openDialog]
  );

  const extractZipSelection = React.useCallback(
    (files: CloudObject[]) => {
      openDialog("extract-zip-selection", { files });
    },
    [openDialog]
  );

  const cancelExtractZip = React.useCallback(
    (file: CloudObject) => {
      void deleteZipExtractionJob(file);
    },
    [deleteZipExtractionJob]
  );

  const previewFile = React.useCallback(
    (file: CloudObject) => {
      openDialog("preview-file", { file });
    },
    [openDialog]
  );

  const editFile = React.useCallback(
    (file: CloudObject) => {
      openDialog("edit-file", { file });
    },
    [openDialog]
  );

  const value = React.useMemo<ExplorerActionsContextValue>(
    () => ({
      deleteItem,
      deleteSelection,
      moveItems,
      renameItem,
      convertFolder,
      extractZip,
      extractZipSelection,
      cancelExtractZip,
      createZipExtractionJob,
      previewFile,
      editFile,
      deletingStatusByKey,
      extractJobs,
    }),
    [
      cancelExtractZip,
      convertFolder,
      createZipExtractionJob,
      deleteItem,
      deleteSelection,
      deletingStatusByKey,
      editFile,
      extractJobs,
      extractZip,
      extractZipSelection,
      moveItems,
      previewFile,
      renameItem,
    ]
  );

  return (
    <ExplorerActionsContext.Provider value={value}>
      {children}
    </ExplorerActionsContext.Provider>
  );
}

export function useExplorerActions() {
  const context = React.useContext(ExplorerActionsContext);
  if (!context) {
    throw new Error(
      "useExplorerActions must be used within ExplorerActionsProvider"
    );
  }
  return context;
}

export { ExplorerActionsContext };
