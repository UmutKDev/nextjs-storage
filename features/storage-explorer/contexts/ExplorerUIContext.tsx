"use client";

import React from "react";
import type { CloudObjectModel } from "@/Service/Generates/api";
import type { ExplorerViewMode } from "../types/explorer.types";

type ExplorerUIContextValue = {
  searchQuery: string;
  setSearchQuery: (nextQuery: string) => void;
  viewMode: ExplorerViewMode;
  setViewMode: (nextMode: ExplorerViewMode) => void;
  isNavigatingBetweenFolders: boolean;
  setIsNavigatingBetweenFolders: (nextValue: boolean) => void;
  isCreateFolderModalOpen: boolean;
  setIsCreateFolderModalOpen: (nextValue: boolean) => void;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (nextValue: boolean) => void;
  activePreviewFile: CloudObjectModel | null;
  setActivePreviewFile: (nextFile: CloudObjectModel | null) => void;
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
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] =
    React.useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [activePreviewFile, setActivePreviewFile] =
    React.useState<CloudObjectModel | null>(null);
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
      isCreateFolderModalOpen,
      setIsCreateFolderModalOpen,
      isUploadModalOpen,
      setIsUploadModalOpen,
      activePreviewFile,
      setActivePreviewFile,
      isMobileSidebarOpen,
      setIsMobileSidebarOpen,
    }),
    [
      activePreviewFile,
      isCreateFolderModalOpen,
      isMobileSidebarOpen,
      isNavigatingBetweenFolders,
      isUploadModalOpen,
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
