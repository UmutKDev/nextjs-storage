"use client";

import React from "react";
import type {
  CloudBreadCrumbListModelResult,
  CloudDirectoryListModelResult,
  CloudObjectListModelResult,
} from "@/Service/Generates/api";
import { useInfiniteCloudList } from "@/hooks/useCloudList";
import type {
  InfiniteData,
  UseInfiniteQueryResult,
  UseQueryResult,
} from "@tanstack/react-query";
import { useEncryptedFolders } from "@/components/Storage/stores/encryptedFolders.store";

const DEFAULT_PAGE_SIZE = 50;

type ExplorerQueryContextValue = {
  currentPath: string;
  breadcrumbQuery: UseQueryResult<CloudBreadCrumbListModelResult, Error>;
  objectsQuery: UseInfiniteQueryResult<
    InfiniteData<CloudObjectListModelResult, number>,
    Error
  >;
  directoriesQuery: UseInfiniteQueryResult<
    InfiniteData<CloudDirectoryListModelResult, number>,
    Error
  >;
  invalidateBreadcrumb: () => Promise<void>;
  invalidateObjects: () => Promise<void>;
  invalidateDirectories: () => Promise<void>;
};

const ExplorerQueryContext = React.createContext<ExplorerQueryContextValue | null>(
  null
);

export function ExplorerQueryProvider({
  currentPath,
  children,
}: {
  currentPath: string;
  children: React.ReactNode;
}) {
  const { isFolderEncrypted, isFolderUnlocked } = useEncryptedFolders(
    (state) => ({
      isFolderEncrypted: state.isFolderEncrypted,
      isFolderUnlocked: state.isFolderUnlocked,
    }),
  );
  const isQueryLocked =
    isFolderEncrypted(currentPath) && !isFolderUnlocked(currentPath);

  const { breadcrumbQuery, objectsQuery, directoriesQuery, invalidates } =
    useInfiniteCloudList(currentPath, {
      take: DEFAULT_PAGE_SIZE,
      refetchInterval: isQueryLocked ? false : 5000,
      objectsEnabled: !isQueryLocked,
      directoriesEnabled: !isQueryLocked,
    });

  const value = React.useMemo<ExplorerQueryContextValue>(
    () => ({
      currentPath,
      breadcrumbQuery,
      objectsQuery,
      directoriesQuery,
      invalidateBreadcrumb: invalidates.invalidateBreadcrumb,
      invalidateObjects: invalidates.invalidateObjects,
      invalidateDirectories: invalidates.invalidateDirectories,
    }),
    [
      currentPath,
      breadcrumbQuery,
      directoriesQuery,
      invalidates.invalidateBreadcrumb,
      invalidates.invalidateDirectories,
      invalidates.invalidateObjects,
      objectsQuery,
    ]
  );

  return (
    <ExplorerQueryContext.Provider value={value}>
      {children}
    </ExplorerQueryContext.Provider>
  );
}

export function useExplorerQuery() {
  const context = React.useContext(ExplorerQueryContext);
  if (!context) {
    throw new Error("useExplorerQuery must be used within ExplorerQueryProvider");
  }
  return context;
}
