"use client";

import React from "react";
import type {
  CloudObject,
  Directory,
} from "@/components/storage-browser/types/storage-browser.types";
import { useExplorerSelection } from "./ExplorerSelectionContext";
import { useExplorerFiltering } from "../hooks/useExplorerFiltering";

type OrderedEntry = {
  key: string;
  type: "file" | "folder";
  item: CloudObject | Directory;
};

type ExplorerSelectionRangeContextValue = {
  orderedKeys: string[];
  orderedItemByKey: Map<
    string,
    { type: "file" | "folder"; item: CloudObject | Directory }
  >;
  getActiveKey: () => string | undefined;
  replaceSelectionRange: (
    anchorKey: string,
    targetKey: string,
    options?: { baseSelection?: Set<string> }
  ) => void;
};

const ExplorerSelectionRangeContext =
  React.createContext<ExplorerSelectionRangeContextValue | null>(null);

export function ExplorerSelectionRangeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { replaceSelectedItemKeys, selectedItemKeys } = useExplorerSelection();
  const { filteredDirectoryItems, filteredObjectItems } = useExplorerFiltering();

  const orderedItems = React.useMemo<OrderedEntry[]>(() => {
    const items: OrderedEntry[] = [];
    filteredDirectoryItems.forEach((directory, index) => {
      items.push({
        key: directory.Prefix || `dir-${index}`,
        type: "folder",
        item: directory,
      });
    });
    filteredObjectItems.forEach((file, index) => {
      items.push({
        key: file.Path?.Key ?? `file-${index}`,
        type: "file",
        item: file,
      });
    });
    return items;
  }, [filteredDirectoryItems, filteredObjectItems]);

  const orderedKeys = React.useMemo(
    () => orderedItems.map((item) => item.key),
    [orderedItems]
  );

  const orderedItemByKey = React.useMemo(() => {
    const map = new Map<
      string,
      { type: "file" | "folder"; item: CloudObject | Directory }
    >();
    orderedItems.forEach((entry) => {
      map.set(entry.key, { type: entry.type, item: entry.item });
    });
    return map;
  }, [orderedItems]);

  const getActiveKey = React.useCallback(() => {
    let lastSelected: string | null = null;
    orderedKeys.forEach((key) => {
      if (selectedItemKeys.has(key)) lastSelected = key;
    });
    if (lastSelected) return lastSelected;
    return orderedKeys[0];
  }, [orderedKeys, selectedItemKeys]);

  const replaceSelectionRange = React.useCallback(
    (
      anchorKey: string,
      targetKey: string,
      options?: { baseSelection?: Set<string> }
    ) => {
      const anchorIndex = orderedKeys.indexOf(anchorKey);
      const targetIndex = orderedKeys.indexOf(targetKey);
      if (anchorIndex === -1 || targetIndex === -1) return;
      const [start, end] =
        anchorIndex < targetIndex
          ? [anchorIndex, targetIndex]
          : [targetIndex, anchorIndex];
      const nextSelection = new Set(options?.baseSelection ?? []);
      orderedKeys.slice(start, end + 1).forEach((key) => {
        nextSelection.add(key);
      });
      replaceSelectedItemKeys(nextSelection);
    },
    [orderedKeys, replaceSelectedItemKeys]
  );

  const value = React.useMemo<ExplorerSelectionRangeContextValue>(
    () => ({
      orderedKeys,
      orderedItemByKey,
      getActiveKey,
      replaceSelectionRange,
    }),
    [getActiveKey, orderedItemByKey, orderedKeys, replaceSelectionRange]
  );

  return (
    <ExplorerSelectionRangeContext.Provider value={value}>
      {children}
    </ExplorerSelectionRangeContext.Provider>
  );
}

export function useExplorerSelectionRange() {
  const context = React.useContext(ExplorerSelectionRangeContext);
  if (!context) {
    throw new Error(
      "useExplorerSelectionRange must be used within ExplorerSelectionRangeProvider"
    );
  }
  return context;
}

export { ExplorerSelectionRangeContext };
