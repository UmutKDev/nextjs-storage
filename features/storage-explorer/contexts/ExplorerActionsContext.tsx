"use client";

import React from "react";
import type {
  CloudObjectModel,
  CloudArchiveCreateStartRequestModelFormatEnum,
} from "@/Service/Generates/api";
import type {
  CloudObject,
  Directory,
  ArchiveExtractJobsByKey,
  ArchiveCreateJobsByKey,
} from "@/components/storage-browser/types/storage-browser.types";
import { useDialogs } from "./DialogsContext";
import { useExplorerDelete } from "../hooks/useExplorerDelete";
import { useExplorerArchiveExtract } from "../hooks/useExplorerArchiveExtract";
import { useExplorerArchiveCreate } from "../hooks/useExplorerArchiveCreate";
import { useExplorerItemNavigation } from "./ExplorerNavigationContext";

type ExplorerActionsContextValue = {
  deleteItem: (item: CloudObject | Directory) => void;
  deleteSelection: (count: number) => void;
  moveItems: (items: string[]) => void;
  renameItem: (item: CloudObject | Directory) => void;
  convertFolder: (directory: Directory) => void;
  extractArchive: (file: CloudObject) => void;
  extractArchiveSelection: (files: CloudObject[]) => void;
  cancelArchiveExtraction: (file: CloudObject) => void;
  createArchiveExtractionJob: (
    file: CloudObjectModel,
    selectedEntries?: string[],
    totalEntries?: number,
  ) => Promise<void>;
  createArchive: (keys: string[]) => void;
  startArchiveCreation: (
    keys: string[],
    format?: CloudArchiveCreateStartRequestModelFormatEnum,
    outputName?: string,
  ) => Promise<void>;
  cancelArchiveCreation: (jobKey: string) => void;
  previewFile: (file: CloudObject) => void;
  editFile: (file: CloudObject) => void;
  deletingStatusByKey: Record<string, boolean>;
  extractJobs: ArchiveExtractJobsByKey;
  createJobs: ArchiveCreateJobsByKey;
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
  const {
    extractJobs,
    createArchiveExtractionJob,
    cancelArchiveExtractionJob,
  } = useExplorerArchiveExtract();
  const { createJobs, startArchiveCreation, cancelArchiveCreation } =
    useExplorerArchiveCreate();
  const { renameItem } = useExplorerItemNavigation();

  const deleteItem = React.useCallback(
    (item: CloudObject | Directory) => {
      openDialog("delete-item", { item });
    },
    [openDialog],
  );

  const deleteSelection = React.useCallback(
    (count: number) => {
      openDialog("delete-selection", { count });
    },
    [openDialog],
  );

  const moveItems = React.useCallback(
    (items: string[]) => {
      openDialog("move-items", { items });
    },
    [openDialog],
  );

  const convertFolder = React.useCallback(
    (directory: Directory) => {
      openDialog("convert-folder", { directory });
    },
    [openDialog],
  );

  const extractArchive = React.useCallback(
    (file: CloudObject) => {
      openDialog("archive-preview-extract", { file });
    },
    [openDialog],
  );

  const extractArchiveSelection = React.useCallback(
    (files: CloudObject[]) => {
      openDialog("archive-extract-selection", { files });
    },
    [openDialog],
  );

  const cancelArchiveExtraction = React.useCallback(
    (file: CloudObject) => {
      void cancelArchiveExtractionJob(file);
    },
    [cancelArchiveExtractionJob],
  );

  const createArchive = React.useCallback(
    (keys: string[]) => {
      openDialog("archive-create", { keys });
    },
    [openDialog],
  );

  const previewFile = React.useCallback(
    (file: CloudObject) => {
      openDialog("preview-file", { file });
    },
    [openDialog],
  );

  const editFile = React.useCallback(
    (file: CloudObject) => {
      openDialog("edit-file", { file });
    },
    [openDialog],
  );

  const value = React.useMemo<ExplorerActionsContextValue>(
    () => ({
      deleteItem,
      deleteSelection,
      moveItems,
      renameItem,
      convertFolder,
      extractArchive,
      extractArchiveSelection,
      cancelArchiveExtraction,
      createArchiveExtractionJob,
      createArchive,
      startArchiveCreation,
      cancelArchiveCreation,
      previewFile,
      editFile,
      deletingStatusByKey,
      extractJobs,
      createJobs,
    }),
    [
      cancelArchiveCreation,
      cancelArchiveExtraction,
      convertFolder,
      createArchive,
      createArchiveExtractionJob,
      createJobs,
      deleteItem,
      deleteSelection,
      deletingStatusByKey,
      editFile,
      extractArchive,
      extractArchiveSelection,
      extractJobs,
      moveItems,
      previewFile,
      renameItem,
      startArchiveCreation,
    ],
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
      "useExplorerActions must be used within ExplorerActionsProvider",
    );
  }
  return context;
}

export { ExplorerActionsContext };
