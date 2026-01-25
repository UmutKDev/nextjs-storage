"use client";

import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useEncryptedFolders } from "@/components/Storage/stores/encryptedFolders.store";
import { useStorage } from "@/components/Storage/StorageProvider";
import {
  CLOUD_DIRECTORIES_QUERY_KEY,
  CLOUD_OBJECTS_QUERY_KEY,
} from "@/hooks/useCloudList";
import { useExplorerQuery } from "./ExplorerQueryContext";
import { getFolderNameFromPrefix } from "../utils/path";

type ExplorerEncryptionContextValue = {
  isExplorerLocked: boolean;
  isAccessDenied: boolean;
  lockedFolderPath: string;
  requestFolderUnlock: (options: {
    path: string;
    label: string;
    force?: boolean;
    onSuccess?: (token?: string) => void;
  }) => void;
  registerEncryptedFolderPath: (path: string) => void;
  isFolderEncrypted: (path?: string | null) => boolean;
  isFolderEncryptedExact: (path?: string | null) => boolean;
  isFolderUnlocked: (path?: string | null) => boolean;
  getSessionToken: (path?: string | null) => string | null;
  getFolderPassphrase: (path: string) => string | undefined;
  refetchManifest: () => Promise<void>;
};

const ExplorerEncryptionContext =
  React.createContext<ExplorerEncryptionContextValue | null>(null);

export function ExplorerEncryptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const { setIsCurrentLocked } = useStorage();
  const {
    objectsQuery,
    directoriesQuery,
    currentPath,
    invalidateDirectories,
    invalidateObjects,
  } = useExplorerQuery();
  const {
    isFolderEncrypted,
    isFolderEncryptedExact,
    isFolderUnlocked,
    promptUnlock,
    getSessionToken,
    getFolderPassphrase,
    registerEncryptedPath,
    refetchManifest,
  } = useEncryptedFolders((state) => ({
    isFolderEncrypted: state.isFolderEncrypted,
    isFolderEncryptedExact: state.isFolderEncryptedExact,
    isFolderUnlocked: state.isFolderUnlocked,
    promptUnlock: state.promptUnlock,
    getSessionToken: state.getSessionToken,
    getFolderPassphrase: state.getFolderPassphrase,
    registerEncryptedPath: state.registerEncryptedPath,
    refetchManifest: state.refetchManifest,
  }));

  const promptedUnlockPathsRef = React.useRef<Set<string>>(new Set());

  const accessDeniedState = React.useMemo(() => {
    const directoryError = directoriesQuery.error;
    const objectError = objectsQuery.error;

    const accessError =
      (isAxiosError(directoryError) && directoryError.response?.status === 403
        ? directoryError
        : null) ||
      (isAxiosError(objectError) && objectError.response?.status === 403
        ? objectError
        : null);

    if (!accessError) return null;

    let path = currentPath;
    const responseData = accessError.response?.data;
    if (responseData?.message && typeof responseData.message === "string") {
      const match = responseData.message.match(/Folder "(.*?)" is encrypted/);
      if (match && match[1]) {
        path = match[1];
      }
    }

    return { path };
  }, [currentPath, directoriesQuery.error, objectsQuery.error]);

  const accessDeniedPath = accessDeniedState?.path;

  React.useEffect(() => {
    if (!accessDeniedPath) {
      console.log("[Explorer] No access denied path");
      return;
    }

    console.log("[Explorer] Access denied for path:", accessDeniedPath);
    registerEncryptedPath(accessDeniedPath);

    if (promptedUnlockPathsRef.current.has(accessDeniedPath)) {
      console.log("[Explorer] Already prompted for:", accessDeniedPath);
      return;
    }

    console.log("[Explorer] Prompting unlock for:", accessDeniedPath);
    promptedUnlockPathsRef.current.add(accessDeniedPath);

    const folderName =
      getFolderNameFromPrefix(accessDeniedPath) ||
      accessDeniedPath.split("/").filter(Boolean).pop() ||
      "şifreli klasör";

    const invalidateAccessDeniedQueries = async () => {
      console.log("[Explorer] Successfully unlocked:", accessDeniedPath);
      await Promise.all([
        queryClient.resetQueries({ queryKey: CLOUD_DIRECTORIES_QUERY_KEY }),
        queryClient.resetQueries({ queryKey: CLOUD_OBJECTS_QUERY_KEY }),
      ]);
      await Promise.all([invalidateDirectories(), invalidateObjects()]);
    };

    const timer = setTimeout(() => {
      console.log("[Explorer] Opening unlock modal for:", accessDeniedPath);
      promptUnlock({
        path: accessDeniedPath,
        label: folderName,
        force: true,
        onSuccess: invalidateAccessDeniedQueries,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [
    accessDeniedPath,
    invalidateDirectories,
    invalidateObjects,
    promptUnlock,
    queryClient,
    registerEncryptedPath,
  ]);

  React.useEffect(() => {
    promptedUnlockPathsRef.current.clear();
  }, [currentPath]);

  const isAccessDenied = Boolean(accessDeniedState);
  const lockedFolderPath = accessDeniedState?.path || currentPath;

  const isExplorerEncrypted =
    isFolderEncrypted(currentPath) ||
    isFolderEncrypted(lockedFolderPath) ||
    isAccessDenied;
  const isExplorerLocked =
    isAccessDenied ||
    (isExplorerEncrypted && !isFolderUnlocked(lockedFolderPath));

  React.useEffect(() => {
    setIsCurrentLocked(isExplorerLocked);
  }, [isExplorerLocked, setIsCurrentLocked]);

  React.useEffect(() => {
    const allDirectories =
      directoriesQuery.data?.pages?.flatMap((page) => page?.items ?? []) ?? [];
    allDirectories.forEach((directory) => {
      if (directory.IsEncrypted && directory.Prefix) {
        registerEncryptedPath(directory.Prefix);
      }
    });
  }, [directoriesQuery.data, registerEncryptedPath]);

  const requestFolderUnlock = React.useCallback(
    (options: {
      path: string;
      label: string;
      force?: boolean;
      onSuccess?: (token?: string) => void;
    }) => {
      promptUnlock(options);
    },
    [promptUnlock],
  );

  const registerEncryptedFolderPath = React.useCallback(
    (path: string) => {
      registerEncryptedPath(path);
    },
    [registerEncryptedPath],
  );

  const value = React.useMemo<ExplorerEncryptionContextValue>(
    () => ({
      isExplorerLocked,
      isAccessDenied,
      lockedFolderPath,
      requestFolderUnlock,
      registerEncryptedFolderPath,
      isFolderEncrypted,
      isFolderEncryptedExact,
      isFolderUnlocked,
      getSessionToken,
      getFolderPassphrase,
      refetchManifest,
    }),
    [
      getFolderPassphrase,
      getSessionToken,
      isAccessDenied,
      isExplorerLocked,
      isFolderEncrypted,
      isFolderEncryptedExact,
      isFolderUnlocked,
      lockedFolderPath,
      refetchManifest,
      requestFolderUnlock,
      registerEncryptedFolderPath,
    ],
  );

  return (
    <ExplorerEncryptionContext.Provider value={value}>
      {children}
    </ExplorerEncryptionContext.Provider>
  );
}

export function useExplorerEncryption() {
  const context = React.useContext(ExplorerEncryptionContext);
  if (!context) {
    throw new Error(
      "useExplorerEncryption must be used within ExplorerEncryptionProvider",
    );
  }
  return context;
}
