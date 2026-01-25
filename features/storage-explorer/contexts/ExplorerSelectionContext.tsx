"use client";

import React from "react";
import { useExplorerQuery } from "./ExplorerQueryContext";

type ExplorerSelectionContextValue = {
  selectedItemKeys: Set<string>;
  selectItem: (itemKey: string) => void;
  toggleItemSelection: (itemKey: string) => void;
  clearSelection: () => void;
  replaceSelectedItemKeys: (nextKeys: Set<string>) => void;
  selectAllVisibleItems: (itemKeys: string[]) => void;
};

const ExplorerSelectionContext =
  React.createContext<ExplorerSelectionContextValue | null>(null);

export function ExplorerSelectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentPath } = useExplorerQuery();
  const [selectedItemKeys, setSelectedItemKeys] = React.useState<Set<string>>(
    new Set()
  );

  React.useEffect(() => {
    setSelectedItemKeys(new Set());
  }, [currentPath]);

  const selectItem = React.useCallback((itemKey: string) => {
    setSelectedItemKeys((previousKeys) => {
      const nextKeys = new Set(previousKeys);
      nextKeys.add(itemKey);
      return nextKeys;
    });
  }, []);

  const toggleItemSelection = React.useCallback((itemKey: string) => {
    setSelectedItemKeys((previousKeys) => {
      const nextKeys = new Set(previousKeys);
      if (nextKeys.has(itemKey)) {
        nextKeys.delete(itemKey);
      } else {
        nextKeys.add(itemKey);
      }
      return nextKeys;
    });
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedItemKeys(new Set());
  }, []);

  const replaceSelectedItemKeys = React.useCallback((nextKeys: Set<string>) => {
    setSelectedItemKeys(new Set(nextKeys));
  }, []);

  const selectAllVisibleItems = React.useCallback((itemKeys: string[]) => {
    setSelectedItemKeys(new Set(itemKeys));
  }, []);

  const value = React.useMemo<ExplorerSelectionContextValue>(
    () => ({
      selectedItemKeys,
      selectItem,
      toggleItemSelection,
      clearSelection,
      replaceSelectedItemKeys,
      selectAllVisibleItems,
    }),
    [
      clearSelection,
      replaceSelectedItemKeys,
      selectAllVisibleItems,
      selectedItemKeys,
      selectItem,
      toggleItemSelection,
    ]
  );

  return (
    <ExplorerSelectionContext.Provider value={value}>
      {children}
    </ExplorerSelectionContext.Provider>
  );
}

export function useExplorerSelection() {
  const context = React.useContext(ExplorerSelectionContext);
  if (!context) {
    throw new Error(
      "useExplorerSelection must be used within ExplorerSelectionProvider"
    );
  }
  return context;
}
