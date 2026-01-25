"use client";

import React from "react";
import type { ExplorerViewMode } from "../types/explorer.types";

type ExplorerUIContextValue = {
  searchQuery: string;
  setSearchQuery: (nextQuery: string) => void;
  viewMode: ExplorerViewMode;
  setViewMode: (nextMode: ExplorerViewMode) => void;
  isNavigatingBetweenFolders: boolean;
  setIsNavigatingBetweenFolders: (nextValue: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (nextValue: boolean) => void;
};

const ExplorerUIContext = React.createContext<ExplorerUIContextValue | null>(
  null
);

export function ExplorerUIProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<ExplorerViewMode>("list");
  const [isNavigatingBetweenFolders, setIsNavigatingBetweenFolders] =
    React.useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    React.useState(false);

  const value = React.useMemo<ExplorerUIContextValue>(
    () => ({
      searchQuery,
      setSearchQuery,
      viewMode,
      setViewMode,
      isNavigatingBetweenFolders,
      setIsNavigatingBetweenFolders,
      isMobileSidebarOpen,
      setIsMobileSidebarOpen,
    }),
    [
      isMobileSidebarOpen,
      isNavigatingBetweenFolders,
      searchQuery,
      viewMode,
    ]
  );

  return (
    <ExplorerUIContext.Provider value={value}>
      {children}
    </ExplorerUIContext.Provider>
  );
}

export function useExplorerUI() {
  const context = React.useContext(ExplorerUIContext);
  if (!context) {
    throw new Error("useExplorerUI must be used within ExplorerUIProvider");
  }
  return context;
}
