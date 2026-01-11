"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

import { cloudApiFactory } from "@/Service/Factories";
import UnlockEncryptedFolderModal from "./UnlockEncryptedFolderModal";

type UnlockPrompt = {
  path: string;
  displayName: string;
  onSuccess?: (token: string) => void;
};

type EncryptedFoldersContextValue = {
  isFolderEncrypted: (path?: string | null) => boolean;
  isFolderUnlocked: (path?: string | null) => boolean;
  getSessionToken: (path?: string | null) => string | null;
  getFolderPassphrase: (path?: string | null) => string | undefined;
  registerEncryptedPath: (path: string) => void;
  promptUnlock: (options: {
    path: string;
    label?: string;
    onSuccess?: (token: string) => void;
    force?: boolean;
  }) => void;
  clearSession: (path: string) => void;
  clearAllSessions: () => void;
  refetchManifest: () => Promise<void>;
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

  const [encryptedPaths, setEncryptedPaths] = useState<Set<string>>(new Set());
  const [sessions, setSessions] = useState<
    Record<string, { token: string; expiresAt: number }>
  >({});
  const [passphrases, setPassphrases] = useState<Record<string, string>>({});
  const [unlockPrompt, setUnlockPrompt] = useState<UnlockPrompt | null>(null);

  // Restore sessions from sessionStorage on mount
  React.useEffect(() => {
    try {
      const storedSessions = window.sessionStorage.getItem("folderSessions");
      if (storedSessions) {
        const parsed = JSON.parse(storedSessions);
        setSessions(parsed);
      }

      const storedKeys = window.sessionStorage.getItem("folderPassphrases");
      if (storedKeys) {
        setPassphrases(JSON.parse(storedKeys));
      }

      const storedEncrypted = window.sessionStorage.getItem("encryptedPaths");
      if (storedEncrypted) {
        setEncryptedPaths(new Set(JSON.parse(storedEncrypted)));
      }
    } catch (e) {
      /* ignore */
    }
  }, []);

  // Persist sessions
  React.useEffect(() => {
    window.sessionStorage.setItem("folderSessions", JSON.stringify(sessions));
  }, [sessions]);

  // Persist passphrases
  React.useEffect(() => {
    window.sessionStorage.setItem(
      "folderPassphrases",
      JSON.stringify(passphrases)
    );
  }, [passphrases]);

  // Persist encrypted metadata known paths
  React.useEffect(() => {
    window.sessionStorage.setItem(
      "encryptedPaths",
      JSON.stringify(Array.from(encryptedPaths))
    );
  }, [encryptedPaths]);

  const findEncryptedAncestor = useCallback(
    (normalized?: string | null) => {
      if (!normalized) return undefined;
      if (encryptedPaths.has(normalized)) return normalized;

      let current = normalized;
      while (current) {
        if (encryptedPaths.has(current)) return current;
        const separatorIndex = current.lastIndexOf("/");
        if (separatorIndex === -1) break;
        current = current.slice(0, separatorIndex);
      }
      if (encryptedPaths.has(current)) return current;
      return undefined;
    },
    [encryptedPaths]
  );

  const isFolderEncrypted = useCallback(
    (path?: string | null) => {
      const normalized = normalizeFolderPath(path);
      if (!normalized) return false;
      return Boolean(findEncryptedAncestor(normalized));
    },
    [findEncryptedAncestor]
  );

  const registerEncryptedPath = useCallback((path: string) => {
    const normalized = normalizeFolderPath(path);
    if (!normalized) return;
    setEncryptedPaths((prev) => {
      if (prev.has(normalized)) return prev;
      const next = new Set(prev);
      next.add(normalized);
      return next;
    });
  }, []);

  const getSessionToken = useCallback(
    (path?: string | null) => {
      const normalized = normalizeFolderPath(path);
      if (!normalized) return null;
      const encryptedPath = findEncryptedAncestor(normalized);
      if (!encryptedPath) return null;

      const session = sessions[encryptedPath];
      if (!session) return null;

      if (session.expiresAt * 1000 < Date.now() + 10000) {
        return null;
      }
      return session.token;
    },
    [findEncryptedAncestor, sessions]
  );

  const getFolderPassphrase = useCallback(
    (path?: string | null) => {
      const normalized = normalizeFolderPath(path);
      if (!normalized) return undefined;
      const encryptedPath = findEncryptedAncestor(normalized);
      if (!encryptedPath) return undefined;
      return passphrases[encryptedPath];
    },
    [findEncryptedAncestor, passphrases]
  );

  const isFolderUnlocked = useCallback(
    (path?: string | null) => {
      return Boolean(getSessionToken(path));
    },
    [getSessionToken]
  );

  const clearSession = useCallback((path: string) => {
    const normalized = normalizeFolderPath(path);
    if (!normalized) return;
    setSessions((prev) => {
      const next = { ...prev };
      delete next[normalized];
      return next;
    });
    setPassphrases((prev) => {
      const next = { ...prev };
      delete next[normalized];
      return next;
    });
  }, []);

  const clearAllSessions = useCallback(() => {
    setSessions({});
    setPassphrases({});
    setEncryptedPaths(new Set());
  }, []);

  React.useEffect(() => {
    if (status === "unauthenticated") {
      clearAllSessions();
    }
  }, [status, clearAllSessions]);

  const unlockFolder = useCallback(
    async (path: string, passphrase: string) => {
      const normalized = normalizeFolderPath(path);
      if (!normalized) throw new Error("Invalid folder path.");

      const response = await cloudApiFactory.directoryUnlock({
        xFolderPassphrase: passphrase,
        directoryUnlockRequestModel: {
          Path: normalized,
        },
      });

      const result = response.data?.result;
      if (!result) throw new Error("No result returned from server.");

      const { SessionToken, ExpiresAt } = result;
      if (!SessionToken) throw new Error("No session token returned.");

      setSessions((prev) => ({
        ...prev,
        [normalized]: {
          token: SessionToken,
          expiresAt: ExpiresAt ?? Date.now() / 1000 + 900,
        },
      }));
      setPassphrases((prev) => ({ ...prev, [normalized]: passphrase }));
      registerEncryptedPath(normalized);

      return SessionToken;
    },
    [registerEncryptedPath]
  );

  const promptUnlock = useCallback(
    ({
      path,
      label,
      onSuccess,
      force,
    }: {
      path: string;
      label?: string;
      onSuccess?: (token: string) => void;
      force?: boolean;
    }) => {
      const normalized = normalizeFolderPath(path);
      if (!normalized) return;

      if (!force && isFolderUnlocked(normalized)) {
        const token = getSessionToken(normalized);
        if (token) onSuccess?.(token);
        return;
      }

      const encryptedPath = findEncryptedAncestor(normalized);
      const targetPath = encryptedPath ?? normalized;
      const displayName =
        label ||
        normalized.split("/").filter(Boolean).pop() ||
        normalized ||
        "bu klasör";

      setUnlockPrompt({ path: targetPath, displayName, onSuccess });
    },
    [findEncryptedAncestor, getSessionToken, isFolderUnlocked]
  );

  const handleUnlockSubmit = useCallback(
    async (passphrase: string) => {
      if (!unlockPrompt) return;
      try {
        const token = await unlockFolder(unlockPrompt.path, passphrase);
        toast.success("Folder unlocked");
        unlockPrompt.onSuccess?.(token);
        setUnlockPrompt(null);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    [unlockFolder, unlockPrompt]
  );

  const value = useMemo<EncryptedFoldersContextValue>(
    () => ({
      isFolderEncrypted,
      isFolderUnlocked,
      getSessionToken,
      getFolderPassphrase,
      registerEncryptedPath,
      promptUnlock,
      clearSession,
      clearAllSessions,
      refetchManifest: async () => {}, // No-op
    }),
    [
      isFolderEncrypted,
      isFolderUnlocked,
      getSessionToken,
      getFolderPassphrase,
      registerEncryptedPath,
      promptUnlock,
      clearSession,
      clearAllSessions,
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
