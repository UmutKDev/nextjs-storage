"use client";

import React from "react";
import { isAxiosError } from "axios";
import EditFileModal from "@/components/Storage/EditFileModal";
import type { CloudObjectModel } from "@/Service/Generates/api";
import { cloudApiFactory } from "@/Service/Factories";
import { useExplorerQuery } from "../../contexts/ExplorerQueryContext";
import { useExplorerEncryption } from "../../contexts/ExplorerEncryptionContext";
import {
  useConflictResolution,
  extractConflictDetails,
} from "../../contexts/ConflictResolutionContext";
import type { ConflictStrategy } from "@/components/Storage/ConflictResolutionModal";

type EditFileDialogProps = {
  open: boolean;
  payload: { file: CloudObjectModel } | null;
  onClose: () => void;
};

export default function EditFileDialog({
  open,
  payload,
  onClose,
}: EditFileDialogProps) {
  const file = payload?.file ?? null;
  const { invalidateObjects } = useExplorerQuery();
  const { getSessionToken } = useExplorerEncryption();
  const { promptConflictResolution } = useConflictResolution();

  const handleConfirm = React.useCallback(
    async (editPayload: { name: string; metadata: Record<string, string> }) => {
      if (!file?.Path?.Key) {
        onClose();
        return;
      }

      const key = file.Path.Key;
      const sessionToken = getSessionToken(key);
      const sessionOptions = sessionToken
        ? { headers: { "x-folder-session": sessionToken } }
        : undefined;

      // Build full name with extension
      const ext = file.Extension
        ? String(file.Extension).replace(/^\./, "")
        : "";
      const nameToSend =
        editPayload.name && ext
          ? `${editPayload.name}.${ext}`
          : editPayload.name || undefined;

      const mergedMetadata: Record<string, string> = {
        ...(file.Metadata ?? {}),
        ...(editPayload.metadata ?? {}),
      };

      // Keep Originalfilename in sync with the new name
      if (nameToSend) {
        mergedMetadata.Originalfilename = nameToSend;
      }

      const performUpdate = async (conflictStrategy?: ConflictStrategy) => {
        try {
          await cloudApiFactory.update(
            {
              cloudUpdateRequestModel: {
                Key: key,
                Name: nameToSend,
                Metadata: mergedMetadata,
                ConflictStrategy: conflictStrategy as
                  | "FAIL"
                  | "REPLACE"
                  | "SKIP"
                  | "KEEP_BOTH"
                  | undefined,
              },
            },
            sessionOptions,
          );
          await invalidateObjects();
          onClose();
        } catch (err) {
          const conflictDetails = extractConflictDetails(err);
          if (conflictDetails) {
            const strategy = await promptConflictResolution(
              conflictDetails,
              "Rename File",
            );
            if (strategy) {
              await performUpdate(strategy);
              return;
            }
            // User cancelled — stay in dialog
            return;
          }
          if (isAxiosError(err)) {
            console.error("Update failed", err.response?.data ?? err.message);
          } else {
            console.error("Update failed", err);
          }
          onClose();
        }
      };

      await performUpdate();
    },
    [
      file,
      getSessionToken,
      invalidateObjects,
      onClose,
      promptConflictResolution,
    ],
  );

  return (
    <EditFileModal
      open={open}
      file={file}
      onClose={onClose}
      onConfirm={handleConfirm}
    />
  );
}
