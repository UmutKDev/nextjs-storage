"use client";

import React from "react";
import { cloudArchiveApiFactory } from "@/Service/Factories";
import { useExplorerEncryption } from "../contexts/ExplorerEncryptionContext";
import type { CloudArchivePreviewResponseModel } from "@/Service/Generates/api";

type ArchivePreviewState = {
  loading: boolean;
  error?: string;
  data?: CloudArchivePreviewResponseModel;
};

export function useArchivePreview() {
  const { getSessionToken } = useExplorerEncryption();
  const [previewState, setPreviewState] = React.useState<ArchivePreviewState>({
    loading: false,
  });

  const fetchPreview = React.useCallback(
    async (key: string) => {
      setPreviewState({ loading: true });
      try {
        const sessionToken = getSessionToken(key);
        const response = await cloudArchiveApiFactory.archivePreview({
          key,
          xFolderSession: sessionToken ?? undefined,
        });
        setPreviewState({ loading: false, data: response.data?.Result });
      } catch {
        setPreviewState({
          loading: false,
          error: "Arsiv icerigi yuklenemedi",
        });
      }
    },
    [getSessionToken],
  );

  const resetPreview = React.useCallback(() => {
    setPreviewState({ loading: false });
  }, []);

  return { previewState, fetchPreview, resetPreview };
}
