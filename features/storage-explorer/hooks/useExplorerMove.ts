"use client";

import React from "react";
import { cloudApiFactory } from "@/Service/Factories";
import { createIdempotencyKey } from "@/lib/idempotency";
import { useExplorerQuery } from "../contexts/ExplorerQueryContext";
import { useExplorerSelection } from "../contexts/ExplorerSelectionContext";
import { useExplorerEncryption } from "../contexts/ExplorerEncryptionContext";
import { getFolderNameFromPrefix, normalizeFolderPath } from "../utils/path";

type MoveItemsOptions = {
  skipUnlockPrompt?: boolean;
};

export function useExplorerMove() {
  const { invalidateObjects, invalidateDirectories } = useExplorerQuery();
  const { replaceSelectedItemKeys } = useExplorerSelection();
  const {
    isFolderEncrypted,
    isFolderUnlocked,
    requestFolderUnlock,
    getSessionToken,
  } = useExplorerEncryption();

  const updateItemsLocation = React.useCallback(
    async function updateItemsLocation(
      sourceKeys: string[],
      destinationKey: string,
      options?: MoveItemsOptions,
    ): Promise<boolean> {
      const normalizedDestination = normalizeFolderPath(
        destinationKey === "/" ? "" : destinationKey,
      );
      const destinationEncrypted =
        normalizedDestination && isFolderEncrypted(normalizedDestination);
      const destinationUnlocked = destinationEncrypted
        ? isFolderUnlocked(normalizedDestination)
        : true;

      if (
        destinationEncrypted &&
        !destinationUnlocked &&
        !options?.skipUnlockPrompt &&
        normalizedDestination
      ) {
        const destinationLabel =
          getFolderNameFromPrefix(destinationKey) ||
          normalizedDestination ||
          "şifreli klasör";
        requestFolderUnlock({
          path: normalizedDestination,
          label: destinationLabel,
          onSuccess: () => {
            void updateItemsLocation(sourceKeys, destinationKey, {
              skipUnlockPrompt: true,
            });
          },
        });
        return false;
      }

      try {
        let moveSessionToken = getSessionToken(destinationKey);
        if (!moveSessionToken) {
          for (const key of sourceKeys) {
            moveSessionToken = getSessionToken(key);
            if (moveSessionToken) break;
          }
        }
        const moveOptions = moveSessionToken
          ? { headers: { "x-folder-session": moveSessionToken } }
          : undefined;

        await cloudApiFactory.move(
          {
            idempotencyKey: createIdempotencyKey(),
            cloudMoveRequestModel: {
              SourceKeys: sourceKeys,
              DestinationKey: destinationKey === "" ? "/" : destinationKey,
            },
          },
          moveOptions,
        );
        replaceSelectedItemKeys(new Set());
        await Promise.all([invalidateObjects(), invalidateDirectories()]);
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    [
      getSessionToken,
      invalidateDirectories,
      invalidateObjects,
      isFolderEncrypted,
      isFolderUnlocked,
      replaceSelectedItemKeys,
      requestFolderUnlock,
    ],
  );

  return { updateItemsLocation };
}
