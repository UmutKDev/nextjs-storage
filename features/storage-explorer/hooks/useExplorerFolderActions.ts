"use client";

import React from "react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import type { CloudDirectoryModel } from "@/Service/Generates/api";
import { cloudApiFactory } from "@/Service/Factories";
import { useExplorerEncryption } from "../contexts/ExplorerEncryptionContext";
import { useExplorerQuery } from "../contexts/ExplorerQueryContext";
import { useExplorerUI } from "../contexts/ExplorerUIContext";
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
  const { isCreateFolderModalOpen, setIsCreateFolderModalOpen } = useExplorerUI();

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

  const [isMoveItemsModalOpen, setIsMoveItemsModalOpen] =
    React.useState(false);
  const [moveSourceKeys, setMoveSourceKeys] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (isExplorerLocked && isCreateFolderModalOpen) {
      setIsCreateFolderModalOpen(false);
      toast.error("Sifrelenmis klasor kilitli. Klasor olusturamazsiniz.");
    }
  }, [isCreateFolderModalOpen, isExplorerLocked, setIsCreateFolderModalOpen]);

  const createFolder = React.useCallback(async () => {
    if (isExplorerLocked) {
      toast.error("Sifrelenmis klasor kilitli. Klasor olusturamazsiniz.");
      return;
    }
    const name = folderNameInput.trim();
    if (!name) {
      toast.error("Folder name required");
      return;
    }
    if (name.includes("/")) {
      toast.error("Folder name cannot contain '/'");
      return;
    }

    if (isNewFolderEncrypted) {
      if (newFolderPassphrase.length < 8) {
        toast.error("Parola en az 8 karakter olmalı");
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

      toast.success(
        isNewFolderEncrypted ? "Şifreli klasör oluşturuldu" : "Folder created"
      );
      setIsCreateFolderModalOpen(false);
      setFolderNameInput("");
      setIsNewFolderEncrypted(false);
      setNewFolderPassphrase("");
    } catch (error) {
      console.error(error);
      if (isAxiosError(error) && error.response?.status === 409) {
        toast.error("Bu isimde klasör zaten var");
      } else {
        toast.error("Failed to create folder");
      }
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
    setIsCreateFolderModalOpen,
  ]);

  const closeConvertModal = React.useCallback(() => {
    setConvertTargetFolder(null);
    setConvertPassphrase("");
  }, []);

  const requestConvertFolder = React.useCallback(
    (directory: CloudDirectoryModel) => {
      const normalizedPath = normalizeFolderPath(directory.Prefix);
      if (!normalizedPath) {
        toast.error("Klasör yolu bulunamadı");
        return;
      }
      if (isFolderEncrypted(normalizedPath) || directory.IsEncrypted) {
        toast.error("Bu klasör zaten şifreli");
        return;
      }
      setConvertTargetFolder(directory);
      setConvertPassphrase("");
    },
    [isFolderEncrypted]
  );

  const convertFolderToEncrypted = React.useCallback(async () => {
    if (!convertTargetFolder) return;
    const normalizedPath = normalizeFolderPath(convertTargetFolder.Prefix);
    if (!normalizedPath) {
      toast.error("Klasör yolu bulunamadı");
      return;
    }
    const passphrase = convertPassphrase.trim();
    if (passphrase.length < 8) {
      toast.error("Parola en az 8 karakter olmalı");
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
      toast.success("Klasör şifreli hale getirildi");
      closeConvertModal();
      await Promise.all([
        invalidateDirectories(),
        invalidateObjects(),
        refetchManifest(),
      ]);
    } catch (error) {
      console.error(error);
      if (isAxiosError(error) && error.response?.status === 409) {
        toast.error("Klasör zaten şifreli görünüyor");
      } else {
        toast.error("Klasör şifrelenemedi");
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

  const requestRenameFolder = React.useCallback((directory: CloudDirectoryModel) => {
    setRenameTargetFolder(directory);
    setRenameValue(getFolderNameFromPrefix(directory.Prefix));
  }, []);

  const updateFolderName = React.useCallback(
    async (
      directory: CloudDirectoryModel,
      newName: string,
      passphraseOverride?: string
    ) => {
      const prefix = directory.Prefix ?? "";
      const normalizedPath = normalizeFolderPath(prefix);
      const folderDisplayName =
        getFolderNameFromPrefix(prefix) || directory.Name || "bu klasör";
      const isEncryptedTarget = Boolean(
        normalizedPath &&
          (isFolderEncryptedExact(normalizedPath) || directory.IsEncrypted)
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

          toast.success("Klasör yeniden adlandırıldı");
          setRenameTargetFolder(null);
          setRenameValue("");
          await Promise.all([
            invalidateDirectories(),
            invalidateObjects(),
            invalidateBreadcrumb(),
          ]);
        } catch (error) {
          console.error(error);
          toast.error("Klasör yeniden adlandırılamadı");
        } finally {
          setIsRenamingFolder(false);
        }
      };

      if (isEncryptedTarget) {
        if (!normalizedPath) {
          toast.error("Klasör yolu bulunamadı");
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
    ]
  );

  const updateFolderNameFromModal = React.useCallback(async () => {
    if (!renameTargetFolder) return;
    const trimmed = renameValue.trim();
    if (!trimmed) {
      toast.error("Klasör adı gerekli");
      return;
    }
    if (trimmed.includes("/")) {
      toast.error("Klasör adı '/' içeremez");
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
        renameTargetFolder.IsEncrypted)
  );
  const renameCurrentName = renameTargetFolder
    ? getFolderNameFromPrefix(renameTargetFolder.Prefix)
    : "";

  const openMoveItemsModal = React.useCallback((sourceKeys: string[]) => {
    setMoveSourceKeys(sourceKeys);
    setIsMoveItemsModalOpen(true);
  }, []);

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
    isMoveItemsModalOpen,
    setIsMoveItemsModalOpen,
    moveSourceKeys,
    openMoveItemsModal,
  };
}
