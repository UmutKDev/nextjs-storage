import React from "react";
import { useEncryptedFolders } from "@/components/Storage/EncryptedFoldersProvider";
import type {
  Directory,
} from "@/components/storage-browser/types/storage-browser.types";

const DIRECTORY_NAME_FALLBACK = "Klasör";

const normalizeDirectoryPath = (prefix?: string | null) => {
  if (!prefix) return "";
  return prefix.replace(/^\/+|\/+$/g, "");
};

export type DirectoryMetadata = {
  normalizedPath: string;
  displayName: string;
  isEncrypted: boolean;
  isUnlocked: boolean;
};

export const useDirectoryMetadata = () => {
  const { isFolderEncrypted, isFolderUnlocked } = useEncryptedFolders();

  const getDirectoryMetadata = React.useCallback(
    (directory: Directory): DirectoryMetadata => {
      const normalizedPath = normalizeDirectoryPath(directory.Prefix);
      const displayName =
        directory.Name ||
        normalizedPath.split("/").filter(Boolean).pop() ||
        directory.Prefix ||
        DIRECTORY_NAME_FALLBACK;
      const isEncrypted = Boolean(
        directory.IsEncrypted || isFolderEncrypted(normalizedPath),
      );
      const isUnlocked = isEncrypted
        ? isFolderUnlocked(normalizedPath)
        : true;
      return { normalizedPath, displayName, isEncrypted, isUnlocked };
    },
    [isFolderEncrypted, isFolderUnlocked],
  );

  return { getDirectoryMetadata };
};
