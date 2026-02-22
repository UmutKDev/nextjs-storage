"use client";

import React from "react";
import type {
  CloudDirectoryModel,
  CloudObjectModel,
} from "@/Service/Generates/api";
import {
  cloudApiFactory,
  cloudDirectoriesApiFactory,
} from "@/Service/Factories";
import { createIdempotencyKey } from "@/lib/idempotency";
import useUserStorageUsage from "@/hooks/useUserStorageUsage";
import { useExplorerEncryption } from "../contexts/ExplorerEncryptionContext";
import { useExplorerQuery } from "../contexts/ExplorerQueryContext";
import { useExplorerSelection } from "../contexts/ExplorerSelectionContext";
import { useExplorerFiltering } from "./useExplorerFiltering";
import { normalizeFolderPath } from "../utils/path";
import { getItemDisplayName } from "../utils/item";

type DeleteSelectionOptions = {
  skipConfirm?: boolean;
};

export function useExplorerDelete() {
  const { invalidate: invalidateUsage } = useUserStorageUsage();
  const { currentPath, invalidateDirectories, invalidateObjects } =
    useExplorerQuery();
  const { selectedItemKeys, replaceSelectedItemKeys } = useExplorerSelection();
  const {
    getFolderPassphrase,
    getSessionToken,
    isFolderEncrypted,
    requestFolderUnlock,
  } = useExplorerEncryption();
  const { objectItems, directoryItems } = useExplorerFiltering();

  const [deletingStatusByKey, setDeletingStatusByKey] = React.useState<
    Record<string, boolean>
  >({});
  const [itemPendingDeletion, setItemPendingDeletion] = React.useState<
    CloudObjectModel | CloudDirectoryModel | null
  >(null);

  const deleteSelectedItems = React.useCallback(
    async ({ skipConfirm = false }: DeleteSelectionOptions = {}) => {
      if (selectedItemKeys.size === 0) return;

      if (
        !skipConfirm &&
        !confirm(
          `Are you sure you want to delete ${selectedItemKeys.size} items?`,
        )
      ) {
        return;
      }

      try {
        const selectedFiles = objectItems.filter(
          (entry) => entry.Path?.Key && selectedItemKeys.has(entry.Path.Key),
        );
        const selectedDirectories = directoryItems.filter(
          (entry) => entry.Prefix && selectedItemKeys.has(entry.Prefix),
        );

        const encryptedDirectories: CloudDirectoryModel[] = [];
        const regularDirectories: CloudDirectoryModel[] = [];
        selectedDirectories.forEach((directory) => {
          const normalizedPath = normalizeFolderPath(directory.Prefix);
          if (normalizedPath && isFolderEncrypted(normalizedPath)) {
            encryptedDirectories.push(directory);
          } else if (directory.IsEncrypted) {
            encryptedDirectories.push(directory);
          } else {
            regularDirectories.push(directory);
          }
        });

        if (encryptedDirectories.length > 0) {
          const missingPassphrase = encryptedDirectories.find((directory) => {
            const normalizedPath = normalizeFolderPath(directory.Prefix);
            if (!normalizedPath) return true;
            return !getFolderPassphrase(normalizedPath);
          });

          if (missingPassphrase) {
            const normalizedPath = normalizeFolderPath(
              missingPassphrase.Prefix,
            );
            if (normalizedPath) {
              requestFolderUnlock({
                path: normalizedPath,
                label: getItemDisplayName(missingPassphrase),
                onSuccess: () => {
                  void deleteSelectedItems({ skipConfirm: true });
                },
              });
            }
            return;
          }
        }

        if (selectedFiles.length > 0 || regularDirectories.length > 0) {
          const bulkDeleteSession = getSessionToken(currentPath);
          const bulkDeleteOptions = bulkDeleteSession
            ? { headers: { "x-folder-session": bulkDeleteSession } }
            : undefined;
          await cloudApiFactory._delete(
            {
              idempotencyKey: createIdempotencyKey(),
              cloudDeleteRequestModel: {
                Items: [
                  ...selectedFiles.map((file) => ({
                    Key: file.Path!.Key!,
                    IsDirectory: false,
                  })),
                  ...regularDirectories.map((directory) => ({
                    Key: directory.Prefix!,
                    IsDirectory: true,
                  })),
                ],
              },
            },
            bulkDeleteOptions,
          );
        }

        if (encryptedDirectories.length > 0) {
          const deleteEncryptedDirectory = async (
            directory: CloudDirectoryModel,
          ) => {
            const normalizedPath = normalizeFolderPath(directory.Prefix);
            if (!normalizedPath) return;
            const passphrase = getFolderPassphrase(normalizedPath);
            const sessionToken = getSessionToken(normalizedPath);
            await cloudDirectoriesApiFactory.directoryDelete({
              directoryDeleteRequestModel: {
                Path: normalizedPath,
              },
              xFolderPassphrase: passphrase,
              xFolderSession: sessionToken || undefined,
            });
          };

          await Promise.all(encryptedDirectories.map(deleteEncryptedDirectory));
        }

        replaceSelectedItemKeys(new Set());
        await Promise.all([
          invalidateObjects(),
          invalidateDirectories(),
          invalidateUsage(),
        ]);
      } catch (error) {
        console.error(error);
      }
    },
    [
      currentPath,
      directoryItems,
      getFolderPassphrase,
      getSessionToken,
      invalidateDirectories,
      invalidateObjects,
      invalidateUsage,
      isFolderEncrypted,
      objectItems,
      replaceSelectedItemKeys,
      requestFolderUnlock,
      selectedItemKeys,
    ],
  );

  const deleteItem = React.useCallback(
    async (entry: CloudObjectModel | CloudDirectoryModel) => {
      const isDirectory = "Prefix" in entry;
      const key = isDirectory
        ? (entry as CloudDirectoryModel).Prefix
        : (entry as CloudObjectModel).Path?.Key;

      if (!key) return;

      setDeletingStatusByKey((previous) => ({ ...previous, [key]: true }));
      try {
        const deleteSessionToken = getSessionToken(key);
        const deleteOptions = deleteSessionToken
          ? { headers: { "x-folder-session": deleteSessionToken } }
          : undefined;
        if (isDirectory) {
          const directory = entry as CloudDirectoryModel;
          const normalizedPath = normalizeFolderPath(directory.Prefix);
          const encryptedPath =
            normalizedPath && isFolderEncrypted(normalizedPath);
          const shouldTreatAsEncrypted = Boolean(
            encryptedPath || (directory.IsEncrypted && normalizedPath),
          );

          if (shouldTreatAsEncrypted && normalizedPath) {
            const passphrase = getFolderPassphrase(normalizedPath);
            const sessionToken = getSessionToken(normalizedPath);
            if (!passphrase && !sessionToken) {
              setDeletingStatusByKey((previous) => ({
                ...previous,
                [key]: false,
              }));
              requestFolderUnlock({
                path: normalizedPath,
                label: getItemDisplayName(entry),
                onSuccess: () => {
                  void deleteItem(entry);
                },
              });
              return;
            }
            await cloudDirectoriesApiFactory.directoryDelete({
              directoryDeleteRequestModel: {
                Path: normalizedPath,
              },
              xFolderPassphrase: passphrase,
              xFolderSession: getSessionToken(normalizedPath) || undefined,
            });
          } else {
            await cloudApiFactory._delete(
              {
                idempotencyKey: createIdempotencyKey(),
                cloudDeleteRequestModel: {
                  Items: [{ Key: key, IsDirectory: true }],
                },
              },
              deleteOptions,
            );
          }
        } else {
          await cloudApiFactory._delete(
            {
              idempotencyKey: createIdempotencyKey(),
              cloudDeleteRequestModel: {
                Items: [{ Key: key, IsDirectory: isDirectory }],
              },
            },
            deleteOptions,
          );
        }
        // Deleted successfully
        await Promise.all([
          invalidateObjects(),
          invalidateDirectories(),
          invalidateUsage(),
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setDeletingStatusByKey((previous) => ({ ...previous, [key]: false }));
        setItemPendingDeletion(null);
      }
    },
    [
      getFolderPassphrase,
      getSessionToken,
      invalidateDirectories,
      invalidateObjects,
      invalidateUsage,
      isFolderEncrypted,
      requestFolderUnlock,
    ],
  );

  return {
    deletingStatusByKey,
    itemPendingDeletion,
    setItemPendingDeletion,
    deleteSelectedItems,
    deleteItem,
    getItemDisplayName,
  };
}
