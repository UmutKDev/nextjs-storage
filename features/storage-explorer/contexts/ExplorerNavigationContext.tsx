"use client";

import React from "react";
import { useStorage } from "@/components/Storage/StorageProvider";
import { useEncryptedFolders } from "@/components/Storage/EncryptedFoldersProvider";
import { useDirectoryMetadata } from "@/components/storage-browser/hooks/useDirectoryMetadata";
import type {
  CloudObject,
  Directory,
} from "@/components/storage-browser/types/storage-browser.types";
import { useDialogs } from "./DialogsContext";
import { useExplorerSelectionRange } from "./ExplorerSelectionRangeContext";

type ExplorerNavigationContextValue = {
  openEntry: (
    item: CloudObject | Directory,
    itemType: "file" | "folder"
  ) => void;
  openItemByKey: (key: string) => void;
  renameItem: (item: CloudObject | Directory) => void;
  renameItemByKey: (key: string) => void;
};

const ExplorerNavigationContext =
  React.createContext<ExplorerNavigationContextValue | null>(null);

export function ExplorerNavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setCurrentPath } = useStorage();
  const { promptUnlock } = useEncryptedFolders();
  const { getDirectoryMetadata } = useDirectoryMetadata();
  const { openDialog } = useDialogs();
  const { orderedItemByKey } = useExplorerSelectionRange();

  const openEntry = React.useCallback(
    (item: CloudObject | Directory, itemType: "file" | "folder") => {
      if (itemType === "folder") {
        const directory = item as Directory;
        const directoryMetadata = getDirectoryMetadata(directory);
        if (!directoryMetadata.normalizedPath) return;
        if (directoryMetadata.isEncrypted && !directoryMetadata.isUnlocked) {
          promptUnlock({
            path: directoryMetadata.normalizedPath,
            label: directoryMetadata.displayName,
            onSuccess: () => setCurrentPath(directoryMetadata.normalizedPath),
          });
          return;
        }
        setCurrentPath(directoryMetadata.normalizedPath);
      } else {
        openDialog("preview-file", { file: item as CloudObject });
      }
    },
    [getDirectoryMetadata, openDialog, promptUnlock, setCurrentPath]
  );

  const openItemByKey = React.useCallback(
    (key: string) => {
      const entry = orderedItemByKey.get(key);
      if (!entry) return;
      openEntry(entry.item, entry.type);
    },
    [openEntry, orderedItemByKey]
  );

  const renameItem = React.useCallback(
    (item: CloudObject | Directory) => {
      if ("Prefix" in item) {
        openDialog("rename-folder", { directory: item as Directory });
      } else {
        openDialog("edit-file", { file: item as CloudObject });
      }
    },
    [openDialog]
  );

  const renameItemByKey = React.useCallback(
    (key: string) => {
      const entry = orderedItemByKey.get(key);
      if (!entry) return;
      renameItem(entry.item);
    },
    [orderedItemByKey, renameItem]
  );

  const value = React.useMemo<ExplorerNavigationContextValue>(
    () => ({
      openEntry,
      openItemByKey,
      renameItem,
      renameItemByKey,
    }),
    [openEntry, openItemByKey, renameItem, renameItemByKey]
  );

  return (
    <ExplorerNavigationContext.Provider value={value}>
      {children}
    </ExplorerNavigationContext.Provider>
  );
}

export function useExplorerItemNavigation() {
  const context = React.useContext(ExplorerNavigationContext);
  if (!context) {
    throw new Error(
      "useExplorerItemNavigation must be used within ExplorerNavigationProvider"
    );
  }
  return context;
}

export { ExplorerNavigationContext };
