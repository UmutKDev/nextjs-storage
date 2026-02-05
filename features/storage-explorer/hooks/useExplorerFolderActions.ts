"use client";

import React from "react";
import { isAxiosError } from "axios";
import type { CloudDirectoryModel } from "@/Service/Generates/api";
import { cloudApiFactory } from "@/Service/Factories";
import { useExplorerEncryption } from "../contexts/ExplorerEncryptionContext";
import { useExplorerQuery } from "../contexts/ExplorerQueryContext";
import { getFolderNameFromPrefix, normalizeFolderPath } from "../utils/path";

export function useExplorerFolderActions() {
  const {
    currentPath,
    invalidateBreadcrumb,
    invalidateDirectories,
    invalidateObjects,
  } = useExplorerQuery();
  const {
    isExplorerLocked,
    isFolderEncrypted,
    isFolderEncryptedExact,
    getSessionToken,
    getFolderPassphrase,
    requestFolderUnlock,
    refetchManifest,
  } = useExplorerEncryption();
  const [folderNameInput, setFolderNameInput] = React.useState("");
  const [isNewFolderEncrypted, setIsNewFolderEncrypted] = React.useState(false);
  const [newFolderPassphrase, setNewFolderPassphrase] = React.useState("");
  const [isCreatingFolder, setIsCreatingFolder] = React.useState(false);

  const [renameTargetFolder, setRenameTargetFolder] =
    React.useState<CloudDirectoryModel | null>(null);
  const [renameValue, setRenameValue] = React.useState("");
  const [isRenamingFolder, setIsRenamingFolder] = React.useState(false);

  const [convertTargetFolder, setConvertTargetFolder] =
    React.useState<CloudDirectoryModel | null>(null);
  const [convertPassphrase, setConvertPassphrase] = React.useState("");
  const [isConvertingFolder, setIsConvertingFolder] = React.useState(false);

  const createFolder = React.useCallback(async () => {
    if (isExplorerLocked) {
      return;
    }
    const name = folderNameInput.trim();
    if (!name) {
      return;
    }
    if (name.includes("/")) {
      return;
    }

    if (isNewFolderEncrypted) {
      if (newFolderPassphrase.length < 8) {
        return;
      }
    }

    setIsCreatingFolder(true);
    try {
      const prefix = currentPath
        ? currentPath.endsWith("/")
          ? currentPath
          : `${currentPath}/`
        : "";
      const sessionToken = getSessionToken(currentPath);

      if (isNewFolderEncrypted) {
        const path = `${prefix}${name}`.replace(/\/+/g, "/").replace(/\/$/, "");
        await cloudApiFactory.directoryCreate({
          directoryCreateRequestModel: { Path: path, IsEncrypted: true },
          xFolderPassphrase: newFolderPassphrase,
          xFolderSession: sessionToken || undefined,
        });
        await refetchManifest();
      } else {
        const key = `${prefix}${name}/`;
        await cloudApiFactory.directoryCreate({
          directoryCreateRequestModel: { Path: key, IsEncrypted: false },
          xFolderSession: sessionToken || undefined,
        });
      }

      await Promise.all([invalidateDirectories()]);

      setFolderNameInput("");
      setIsNewFolderEncrypted(false);
      setNewFolderPassphrase("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreatingFolder(false);
    }
  }, [
    currentPath,
    folderNameInput,
    getSessionToken,
    invalidateDirectories,
    isExplorerLocked,
    isNewFolderEncrypted,
    newFolderPassphrase,
    refetchManifest,
  ]);

  const closeConvertModal = React.useCallback(() => {
    setConvertTargetFolder(null);
    setConvertPassphrase("");
  }, []);

  const requestConvertFolder = React.useCallback(
    (directory: CloudDirectoryModel) => {
      const normalizedPath = normalizeFolderPath(directory.Prefix);
      if (!normalizedPath) {
        return;
      }
      if (isFolderEncrypted(normalizedPath) || directory.IsEncrypted) {
        return;
      }
      setConvertTargetFolder(directory);
      setConvertPassphrase("");
    },
    [isFolderEncrypted],
  );

  const convertFolderToEncrypted = React.useCallback(async () => {
    if (!convertTargetFolder) return;
    const normalizedPath = normalizeFolderPath(convertTargetFolder.Prefix);
    if (!normalizedPath) {
      return;
    }
    const passphrase = convertPassphrase.trim();
    if (passphrase.length < 8) {
      return;
    }

    setIsConvertingFolder(true);
    try {
      await cloudApiFactory.directoryConvertToEncrypted({
        directoryConvertToEncryptedRequestModel: {
          Path: normalizedPath,
        },
        xFolderPassphrase: passphrase,
        xFolderSession: getSessionToken(normalizedPath) || undefined,
      });
      // Folder converted to encrypted
      closeConvertModal();
      await Promise.all([
        invalidateDirectories(),
        invalidateObjects(),
        refetchManifest(),
      ]);
    } catch (error) {
      console.error(error);
      if (isAxiosError(error) && error.response?.status === 409) {
        // Folder already encrypted
      } else {
        // Folder encryption failed
      }
    } finally {
      setIsConvertingFolder(false);
    }
  }, [
    closeConvertModal,
    convertPassphrase,
    convertTargetFolder,
    getSessionToken,
    invalidateDirectories,
    invalidateObjects,
    refetchManifest,
  ]);

  const closeRenameModal = React.useCallback(() => {
    setRenameTargetFolder(null);
    setRenameValue("");
  }, []);

  const requestRenameFolder = React.useCallback(
    (directory: CloudDirectoryModel) => {
      setRenameTargetFolder(directory);
      setRenameValue(getFolderNameFromPrefix(directory.Prefix));
    },
    [],
  );

  const updateFolderName = React.useCallback(
    async (
      directory: CloudDirectoryModel,
      newName: string,
      passphraseOverride?: string,
    ) => {
      const prefix = directory.Prefix ?? "";
      const normalizedPath = normalizeFolderPath(prefix);
      const folderDisplayName =
        getFolderNameFromPrefix(prefix) || directory.Name || "bu klasör";
      const isEncryptedTarget = Boolean(
        normalizedPath &&
        (isFolderEncryptedExact(normalizedPath) || directory.IsEncrypted),
      );

      const updateFolderNameRequest = async (passphrase?: string) => {
        setIsRenamingFolder(true);
        try {
          if (isEncryptedTarget) {
            if (!normalizedPath) {
              throw new Error("Klasör yolu bulunamadı");
            }
            if (!passphrase) {
              throw new Error("Klasör için parola gerekli");
            }
            await cloudApiFactory.directoryRename({
              directoryRenameRequestModel: {
                Path: normalizedPath,
                Name: newName,
              },
              xFolderPassphrase: passphrase,
              xFolderSession: getSessionToken(normalizedPath) || undefined,
            });
            await refetchManifest();
          } else {
            if (!normalizedPath) throw new Error("Invalid path");

            await cloudApiFactory.directoryRename({
              directoryRenameRequestModel: {
                Path: normalizedPath,
                Name: newName,
              },
              xFolderSession: getSessionToken(normalizedPath) || undefined,
            });
          }

          // Folder renamed successfully
          setRenameTargetFolder(null);
          setRenameValue("");
          await Promise.all([
            invalidateDirectories(),
            invalidateObjects(),
            invalidateBreadcrumb(),
          ]);
        } catch (error) {
          console.error(error);
          // Folder rename failed
        } finally {
          setIsRenamingFolder(false);
        }
      };

      if (isEncryptedTarget) {
        if (!normalizedPath) {
          // Folder path not found
          return;
        }
        const passphrase =
          passphraseOverride ?? getFolderPassphrase(normalizedPath);
        if (!passphrase) {
          requestFolderUnlock({
            path: normalizedPath,
            label: folderDisplayName,
            onSuccess: () => {
              const resolvedPassphrase = getFolderPassphrase(normalizedPath);
              if (resolvedPassphrase) {
                void updateFolderName(directory, newName, resolvedPassphrase);
              }
            },
          });
          return;
        }
        await updateFolderNameRequest(passphrase);
        return;
      }

      await updateFolderNameRequest();
    },
    [
      getFolderPassphrase,
      getSessionToken,
      invalidateBreadcrumb,
      invalidateDirectories,
      invalidateObjects,
      isFolderEncryptedExact,
      refetchManifest,
      requestFolderUnlock,
    ],
  );

  const updateFolderNameFromModal = React.useCallback(async () => {
    if (!renameTargetFolder) return;
    const trimmed = renameValue.trim();
    if (!trimmed) {
      // Folder name required
      return;
    }
    if (trimmed.includes("/")) {
      // Folder name cannot contain '/'
      return;
    }

    const currentName = getFolderNameFromPrefix(renameTargetFolder.Prefix);
    if (currentName === trimmed) {
      closeRenameModal();
      return;
    }

    await updateFolderName(renameTargetFolder, trimmed);
  }, [closeRenameModal, renameTargetFolder, renameValue, updateFolderName]);

  const renameNormalizedPath = renameTargetFolder
    ? normalizeFolderPath(renameTargetFolder.Prefix)
    : "";
  const renameIsEncrypted = Boolean(
    renameTargetFolder &&
    renameNormalizedPath &&
    (isFolderEncryptedExact(renameNormalizedPath) ||
      renameTargetFolder.IsEncrypted),
  );
  const renameCurrentName = renameTargetFolder
    ? getFolderNameFromPrefix(renameTargetFolder.Prefix)
    : "";

  return {
    folderNameInput,
    setFolderNameInput,
    isNewFolderEncrypted,
    setIsNewFolderEncrypted,
    newFolderPassphrase,
    setNewFolderPassphrase,
    isCreatingFolder,
    createFolder,
    renameTargetFolder,
    renameValue,
    setRenameValue,
    isRenamingFolder,
    renameCurrentName,
    renameIsEncrypted,
    closeRenameModal,
    requestRenameFolder,
    updateFolderNameFromModal,
    convertTargetFolder,
    convertPassphrase,
    setConvertPassphrase,
    isConvertingFolder,
    closeConvertModal,
    requestConvertFolder,
    convertFolderToEncrypted,
  };
}
