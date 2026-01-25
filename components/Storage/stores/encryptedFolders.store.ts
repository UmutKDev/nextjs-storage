"use client";

import { createWithEqualityFn } from "zustand/traditional";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { cloudApiFactory } from "@/Service/Factories";
import { sessionManager } from "@/lib/SessionManager";

type UnlockPrompt = {
  path: string;
  displayName: string;
  onSuccess?: (token: string) => void;
};

type SessionData = {
  token: string;
  expiresAt: number;
};

type EncryptedFoldersState = {
  encryptedPaths: Set<string>;
  passphrases: Record<string, string>;
  sessionsByPath: Record<string, SessionData>;
  unlockPrompt: UnlockPrompt | null;
  setUnlockPrompt: (prompt: UnlockPrompt | null) => void;
  syncSessions: (sessions: Record<string, SessionData>) => void;
  isFolderEncrypted: (path?: string | null) => boolean;
  isFolderEncryptedExact: (path?: string | null) => boolean;
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
  unlockFolder: (path: string, passphrase: string) => Promise<string>;
  refetchManifest: () => Promise<void>;
};

const normalizeFolderPath = (path?: string | null) => {
  if (!path) return "";
  return path.replace(/^\/+|\/+$/g, "");
};

const findEncryptedAncestor = (paths: Set<string>, normalized: string) => {
  if (paths.has(normalized)) return normalized;
  let current = normalized;
  while (current) {
    if (paths.has(current)) return current;
    const separatorIndex = current.lastIndexOf("/");
    if (separatorIndex === -1) break;
    current = current.slice(0, separatorIndex);
  }
  if (paths.has(current)) return current;
  return undefined;
};

const getSessionFromMap = (
  sessionsByPath: Record<string, SessionData>,
  normalized: string,
) => {
  const direct = sessionsByPath[normalized];
  if (direct) return direct;
  const segments = normalized.split("/").filter(Boolean);
  for (let i = segments.length - 1; i > 0; i--) {
    const parentPath = segments.slice(0, i).join("/");
    const session = sessionsByPath[parentPath];
    if (session) return session;
  }
  return undefined;
};

const storage =
  typeof window !== "undefined"
    ? createJSONStorage(() => sessionStorage)
    : undefined;

const persistConfig = {
  name: "encrypted-folders",
  partialize: (state: EncryptedFoldersState) => ({
    encryptedPaths: Array.from(state.encryptedPaths),
    passphrases: state.passphrases,
  }),
  merge: (
    persisted: unknown,
    current: EncryptedFoldersState,
  ): EncryptedFoldersState => {
    const data = persisted as {
      encryptedPaths?: string[];
      passphrases?: Record<string, string>;
    };
    return {
      ...current,
      encryptedPaths: new Set(data?.encryptedPaths ?? []),
      passphrases: data?.passphrases ?? {},
    };
  },
  ...(storage ? { storage } : {}),
};

export const useEncryptedFoldersStore =
  createWithEqualityFn<EncryptedFoldersState>()(
    devtools(
      persist(
        (set, get) => ({
        encryptedPaths: new Set(),
        passphrases: {},
        sessionsByPath: {},
        unlockPrompt: null,
        setUnlockPrompt: (prompt) => set({ unlockPrompt: prompt }),
        syncSessions: (sessions) => set({ sessionsByPath: sessions }),
        isFolderEncrypted: (path) => {
          const normalized = normalizeFolderPath(path);
          if (!normalized) return false;
          return Boolean(findEncryptedAncestor(get().encryptedPaths, normalized));
        },
        isFolderEncryptedExact: (path) => {
          const normalized = normalizeFolderPath(path);
          if (!normalized) return false;
          return get().encryptedPaths.has(normalized);
        },
        isFolderUnlocked: (path) => Boolean(get().getSessionToken(path)),
        getSessionToken: (path) => {
          const normalized = normalizeFolderPath(path);
          if (!normalized) return null;
          const session = getSessionFromMap(get().sessionsByPath, normalized);
          return session?.token ?? null;
        },
        getFolderPassphrase: (path) => {
          const normalized = normalizeFolderPath(path);
          if (!normalized) return undefined;
          const { passphrases } = get();
          if (passphrases[normalized]) return passphrases[normalized];
          const segments = normalized.split("/").filter(Boolean);
          for (let i = segments.length - 1; i > 0; i--) {
            const parentPath = segments.slice(0, i).join("/");
            if (passphrases[parentPath]) return passphrases[parentPath];
          }
          return undefined;
        },
        registerEncryptedPath: (path) => {
          const normalized = normalizeFolderPath(path);
          if (!normalized) return;
          set((state) => {
            if (state.encryptedPaths.has(normalized)) return state;
            const next = new Set(state.encryptedPaths);
            next.add(normalized);
            return { encryptedPaths: next };
          });
        },
        promptUnlock: ({ path, label, onSuccess, force }) => {
          const normalized = normalizeFolderPath(path);
          if (!normalized) return;
          if (!force && get().isFolderUnlocked(normalized)) {
            const token = get().getSessionToken(normalized);
            if (token) onSuccess?.(token);
            return;
          }
          const encryptedPath = findEncryptedAncestor(
            get().encryptedPaths,
            normalized,
          );
          const targetPath = encryptedPath ?? normalized;
          const displayName =
            label ||
            normalized.split("/").filter(Boolean).pop() ||
            normalized ||
            "bu klasör";
          set({ unlockPrompt: { path: targetPath, displayName, onSuccess } });
        },
        clearSession: (path) => {
          const normalized = normalizeFolderPath(path);
          if (!normalized) return;
          sessionManager.clearSession(normalized);
          set((state) => {
            const next = { ...state.passphrases };
            delete next[normalized];
            const sessionsByPath = { ...state.sessionsByPath };
            delete sessionsByPath[normalized];
            return { passphrases: next, sessionsByPath };
          });
        },
        clearAllSessions: () => {
          sessionManager.clearAll();
          set({
            passphrases: {},
            encryptedPaths: new Set(),
            sessionsByPath: {},
          });
        },
        unlockFolder: async (path, passphrase) => {
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

          const { SessionToken, ExpiresAt, EncryptedFolderPath } = result;
          if (!SessionToken) throw new Error("No session token returned.");

          const targetPath = EncryptedFolderPath || normalized;

          sessionManager.setSession(
            targetPath,
            SessionToken,
            ExpiresAt ?? Date.now() / 1000 + 900,
          );

          set((state) => {
            const nextPassphrases = {
              ...state.passphrases,
              [targetPath]: passphrase,
            };
            const nextPaths = new Set(state.encryptedPaths);
            nextPaths.add(targetPath);
            const sessionsByPath = sessionManager.getAllSessions();
            return {
              passphrases: nextPassphrases,
              encryptedPaths: nextPaths,
              sessionsByPath,
            };
          });

          return SessionToken;
        },
        refetchManifest: async () => {},
      }),
      persistConfig,
    ),
    { name: "EncryptedFoldersStore" },
  ),
);

export function useEncryptedFolders(): EncryptedFoldersState;
export function useEncryptedFolders<T>(
  selector: (state: EncryptedFoldersState) => T,
  equalityFn?: (left: T, right: T) => boolean,
): T;
export function useEncryptedFolders<T>(
  selector?: (state: EncryptedFoldersState) => T,
  equalityFn?: (left: T, right: T) => boolean,
) {
  const selectState = (selector ??
    ((state: EncryptedFoldersState) => state)) as (
    state: EncryptedFoldersState,
  ) => T;
  return useEncryptedFoldersStore(selectState, equalityFn ?? shallow);
}
