"use client";

import React from "react";
import { useItemSelection } from "@/components/storage-browser/hooks/useItemSelection";
import { useExplorerItemNavigation } from "@/features/storage-explorer/contexts/ExplorerNavigationContext";
import { useExplorerContextMenu } from "@/features/storage-explorer/contexts/ExplorerContextMenuContext";
import type {
  CloudObject,
  Directory,
} from "@/components/storage-browser/types/storage-browser.types";

type StorageBrowserInteractionsValue = {
  isLoading: boolean;
  updateSelection: (
    itemKey: string,
    options?: { allowMultiple?: boolean; rangeSelect?: boolean },
  ) => void;
  replaceSelection: (nextSelection: Set<string>) => void;
  handleItemClick: (
    item: CloudObject | Directory,
    itemType: "file" | "folder",
    event: React.MouseEvent,
  ) => void;
  openContextMenu: (
    item: CloudObject | Directory,
    itemType: "file" | "folder",
    point: { x: number; y: number },
  ) => void;
};

const StorageBrowserInteractionsContext =
  React.createContext<StorageBrowserInteractionsValue | null>(null);

export function StorageBrowserInteractionsProvider({
  children,
  isLoading,
}: {
  children: React.ReactNode;
  isLoading: boolean;
}) {
  const { updateSelection, replaceSelection } = useItemSelection();
  const { openEntry } = useExplorerItemNavigation();
  const { openContextMenu } = useExplorerContextMenu();

  const handleItemClick = React.useCallback(
    (
      storageItem: CloudObject | Directory,
      itemType: "file" | "folder",
      event: React.MouseEvent,
    ) => {
      const itemKey =
        itemType === "file"
          ? (storageItem as CloudObject).Path?.Key
          : (storageItem as Directory).Prefix;
      if (!itemKey) return;

      if (event.shiftKey) {
        updateSelection(itemKey, { allowMultiple: true, rangeSelect: true });
        return;
      }

      if (event.metaKey || event.ctrlKey) {
        updateSelection(itemKey, { allowMultiple: true });
        return;
      }

      if (!isLoading) openEntry(storageItem, itemType);
    },
    [isLoading, openEntry, updateSelection],
  );

  const value = React.useMemo<StorageBrowserInteractionsValue>(
    () => ({
      isLoading,
      updateSelection,
      replaceSelection,
      handleItemClick,
      openContextMenu,
    }),
    [handleItemClick, isLoading, openContextMenu, replaceSelection, updateSelection],
  );

  return (
    <StorageBrowserInteractionsContext.Provider value={value}>
      {children}
    </StorageBrowserInteractionsContext.Provider>
  );
}

export function useStorageBrowserInteractions() {
  const context = React.useContext(StorageBrowserInteractionsContext);
  if (!context) {
    throw new Error(
      "useStorageBrowserInteractions must be used within StorageBrowserInteractionsProvider",
    );
  }
  return context;
}
