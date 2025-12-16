"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

import { cloudApiFactory } from "@/Service/Factories";
import type { CloudEncryptedFolderSummaryModel } from "@/Service/Generates";
import UnlockEncryptedFolderModal from "./UnlockEncryptedFolderModal";

type UnlockPrompt = {
  path: string;
  displayName: string;
  onSuccess?: (key: string, passphrase?: string) => void;
};

type EncryptedFoldersContextValue = {
  manifest: CloudEncryptedFolderSummaryModel[];
  isFolderEncrypted: (path?: string | null) => boolean;
  isFolderUnlocked: (path?: string | null) => boolean;
  getFolderKey: (path?: string | null) => string | undefined;
  getFolderPassphrase: (path?: string | null) => string | undefined;
  promptUnlock: (options: {
    path: string;
    label?: string;
    onSuccess?: (key: string, passphrase?: string) => void;
  }) => void;
  clearFolderKey: (path: string) => void;
  clearAllKeys: () => void;
  refetchManifest: () => Promise<unknown>;
};

const EncryptedFoldersContext = createContext<
  EncryptedFoldersContextValue | undefined
>(undefined);

const normalizeFolderPath = (path?: string | null) => {
  if (!path) return "";
  return path.replace(/^\/+|\/+$/g, "");
};

const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; title?: string }
      | undefined;
    return data?.message || data?.title || error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
};

export function useEncryptedFolders() {
  const ctx = useContext(EncryptedFoldersContext);
  if (!ctx) {
    throw new Error(
      "useEncryptedFolders must be used inside EncryptedFoldersProvider"
    );
  }
  return ctx;
}

export default function EncryptedFoldersProvider({
  children,
}: React.PropsWithChildren) {
  const { status } = useSession();
  const [folderKeys, setFolderKeys] = useState<Record<string, string>>({});
  const [folderPassphrases, setFolderPassphrases] = React.useState<
    Record<string, string>
  >({});
  const [unlockPrompt, setUnlockPrompt] = useState<UnlockPrompt | null>(null);

  const manifestQuery = useQuery({
    queryKey: ["cloud", "encrypted-folders"],
    queryFn: async ({ signal }) => {
      const response = await cloudApiFactory.listEncryptedFolders({ signal });
      return response.data?.result?.Folders ?? [];
    },
    enabled: status === "authenticated",
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  const manifest = React.useMemo(
    () => manifestQuery.data ?? [],
    [manifestQuery.data]
  );

  const encryptedPaths = useMemo(() => {
    return new Set(manifest.map((f) => normalizeFolderPath(f.Path)));
  }, [manifest]);

  const isFolderEncrypted = useCallback(
    (path?: string | null) => {
      const normalized = normalizeFolderPath(path);
      if (!normalized) return false;
      return encryptedPaths.has(normalized);
    },
    [encryptedPaths]
  );

  const isFolderUnlocked = useCallback(
    (path?: string | null) => {
      const normalized = normalizeFolderPath(path);
      if (!normalized) return false;
      return Boolean(folderKeys[normalized]);
    },
    [folderKeys]
  );

  const getFolderKey = useCallback(
    (path?: string | null) => {
      const normalized = normalizeFolderPath(path);
      if (!normalized) return undefined;
      return folderKeys[normalized];
    },
    [folderKeys]
  );

  const getFolderPassphrase = useCallback(
    (path?: string | null) => {
      const normalized = normalizeFolderPath(path);
      if (!normalized) return undefined;
      return folderPassphrases[normalized];
    },
    [folderPassphrases]
  );

  const cacheFolderKey = useCallback((path: string, key: string) => {
    const normalized = normalizeFolderPath(path);
    if (!normalized) return;
    setFolderKeys((prev) => ({ ...prev, [normalized]: key }));
  }, []);

  const cacheFolderPassphrase = useCallback((path: string, passphrase: string) => {
    const normalized = normalizeFolderPath(path);
    if (!normalized) return;
    setFolderPassphrases((prev) => ({ ...prev, [normalized]: passphrase }));
  }, []);

  const clearFolderKey = useCallback((path: string) => {
    const normalized = normalizeFolderPath(path);
    if (!normalized) return;
    setFolderKeys((prev) => {
      const next = { ...prev };
      delete next[normalized];
      return next;
    });
    setFolderPassphrases((prev) => {
      const next = { ...prev };
      delete next[normalized];
      return next;
    });
  }, []);

  const clearAllKeys = useCallback(() => {
    setFolderKeys({});
    setFolderPassphrases({});
  }, []);

  React.useEffect(() => {
    if (status === "unauthenticated") {
      clearAllKeys();
    }
  }, [status, clearAllKeys]);

  React.useEffect(() => {
    const handler = () => {
      clearAllKeys();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [clearAllKeys]);

  const unlockFolder = useCallback(
    async (path: string, passphrase: string) => {
      const normalized = normalizeFolderPath(path);
      if (!normalized) throw new Error("Invalid folder path.");
      const response = await cloudApiFactory.unlockEncryptedFolder({
        cloudEncryptedFolderUnlockRequestModel: {
          Path: normalized,
          Passphrase: passphrase,
        },
      });
      const key = response.data?.result?.FolderKey;
      if (!key) throw new Error("No folder key returned by the server.");
      cacheFolderKey(normalized, key);
      cacheFolderPassphrase(normalized, passphrase);
      return key;
    },
    [cacheFolderKey, cacheFolderPassphrase]
  );

  const promptUnlock = useCallback(
    ({
      path,
      label,
      onSuccess,
    }: {
      path: string;
      label?: string;
      onSuccess?: (key: string, passphrase?: string) => void;
    }) => {
      const normalized = normalizeFolderPath(path);
      if (!normalized) return;

      if (isFolderUnlocked(normalized)) {
        const cachedKey = getFolderKey(normalized);
        if (cachedKey) onSuccess?.(cachedKey, getFolderPassphrase(normalized));
        return;
      }

      const displayName =
        label ||
        normalized.split("/").filter(Boolean).pop() ||
        normalized ||
        "this folder";

      setUnlockPrompt({ path: normalized, displayName, onSuccess });
    },
    [getFolderKey, getFolderPassphrase, isFolderUnlocked]
  );

  const handleUnlockSubmit = useCallback(
    async (passphrase: string) => {
      if (!unlockPrompt) return;
      try {
        const key = await unlockFolder(unlockPrompt.path, passphrase);
        toast.success("Folder unlocked");
        unlockPrompt.onSuccess?.(key, passphrase);
        setUnlockPrompt(null);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    [unlockFolder, unlockPrompt]
  );

  const value = useMemo<EncryptedFoldersContextValue>(
    () => ({
      manifest,
      isFolderEncrypted,
      isFolderUnlocked,
      getFolderKey,
      getFolderPassphrase,
      promptUnlock,
      clearFolderKey,
      clearAllKeys,
      refetchManifest: manifestQuery.refetch,
    }),
    [
      manifest,
      isFolderEncrypted,
      isFolderUnlocked,
      getFolderKey,
      getFolderPassphrase,
      promptUnlock,
      clearFolderKey,
      clearAllKeys,
      manifestQuery.refetch,
    ]
  );

  return (
    <EncryptedFoldersContext.Provider value={value}>
      {children}
      <UnlockEncryptedFolderModal
        open={Boolean(unlockPrompt)}
        folderName={unlockPrompt?.displayName}
        onClose={() => setUnlockPrompt(null)}
        onSubmit={handleUnlockSubmit}
      />
    </EncryptedFoldersContext.Provider>
  );
}
