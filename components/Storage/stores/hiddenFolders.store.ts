"use client";

import { createWithEqualityFn } from "zustand/traditional";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { cloudDirectoriesApiFactory } from "@/Service/Factories";
import { hiddenSessionManager } from "@/lib/SessionManager";

type RevealPrompt = {
  path: string;
  displayName: string;
  onSuccess?: (token: string) => void;
};

type SessionData = {
  token: string;
  expiresAt: number;
};

type HiddenFoldersState = {
  hiddenPaths: Set<string>;
  sessionsByPath: Record<string, SessionData>;
  revealPrompt: RevealPrompt | null;
  setRevealPrompt: (prompt: RevealPrompt | null) => void;
  syncSessions: (sessions: Record<string, SessionData>) => void;
  isFolderRevealed: (path?: string | null) => boolean;
  getHiddenSessionToken: (path?: string | null) => string | null;
  registerHiddenPath: (path: string) => void;
  promptReveal: (options: {
    path: string;
    label?: string;
    onSuccess?: (token: string) => void;
  }) => void;
  clearSession: (path: string) => void;
  clearAllSessions: () => void;
  revealFolder: (path: string, passphrase: string) => Promise<string>;
};

const normalizeFolderPath = (path?: string | null) => {
  if (!path) return "";
  return path.replace(/^\/+|\/+$/g, "");
};

export const getSessionFromMap = (
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
  name: "hidden-folders",
  partialize: (state: HiddenFoldersState) => ({
    hiddenPaths: Array.from(state.hiddenPaths),
  }),
  merge: (
    persisted: unknown,
    current: HiddenFoldersState,
  ): HiddenFoldersState => {
    const data = persisted as {
      hiddenPaths?: string[];
    };
    return {
      ...current,
      hiddenPaths: new Set(data?.hiddenPaths ?? []),
    };
  },
  ...(storage ? { storage } : {}),
};

export const useHiddenFoldersStore = createWithEqualityFn<HiddenFoldersState>()(
  devtools(
    persist(
      (set, get) => ({
        hiddenPaths: new Set(),
        sessionsByPath: {},
        revealPrompt: null,
        setRevealPrompt: (prompt) => set({ revealPrompt: prompt }),
        syncSessions: (sessions) => set({ sessionsByPath: sessions }),
        isFolderRevealed: (path) => {
          const normalized = normalizeFolderPath(path);
          return Boolean(get().getHiddenSessionToken(normalized));
        },
        getHiddenSessionToken: (path) => {
          const normalized = normalizeFolderPath(path);
          if (!normalized && normalized !== "") return null;
          const session = getSessionFromMap(get().sessionsByPath, normalized);
          return session?.token ?? null;
        },
        registerHiddenPath: (path) => {
          const normalized = normalizeFolderPath(path);
          if (!normalized) return;
          set((state) => {
            if (state.hiddenPaths.has(normalized)) return state;
            const next = new Set(state.hiddenPaths);
            next.add(normalized);
            return { hiddenPaths: next };
          });
        },
        promptReveal: ({ path, label, onSuccess }) => {
          const normalized = normalizeFolderPath(path);
          const displayName =
            label ||
            normalized.split("/").filter(Boolean).pop() ||
            normalized ||
            "bu dizin";
          set({
            revealPrompt: { path: normalized, displayName, onSuccess },
          });
        },
        clearSession: (path) => {
          const normalized = normalizeFolderPath(path);
          if (!normalized && normalized !== "") return;
          hiddenSessionManager.clearSession(normalized);
          set((state) => {
            const sessionsByPath = { ...state.sessionsByPath };
            delete sessionsByPath[normalized];
            return { sessionsByPath };
          });
        },
        clearAllSessions: () => {
          hiddenSessionManager.clearAll();
          set({
            hiddenPaths: new Set(),
            sessionsByPath: {},
          });
        },
        revealFolder: async (path, passphrase) => {
          const normalized = normalizeFolderPath(path);

          const response = await cloudDirectoriesApiFactory.directoryReveal({
            xFolderPassphrase: passphrase,
            directoryRevealRequestModel: {
              Path: normalized || "/",
            },
          });

          const result = response.data?.Result;
          if (!result) throw new Error("No result returned from server.");

          const { SessionToken, ExpiresAt, HiddenFolderPath } = result;
          if (!SessionToken) throw new Error("No session token returned.");

          // Store session under the REQUESTED path (normalized), not HiddenFolderPath.
          // The session token is scoped to the path we requested reveal for,
          // and useCloudList looks it up by normalizedPath (the current browsing path).
          hiddenSessionManager.setSession(
            normalized,
            SessionToken,
            ExpiresAt || Date.now() / 1000 + 900,
          );

          set((state) => {
            const nextPaths = new Set(state.hiddenPaths);
            if (HiddenFolderPath) nextPaths.add(HiddenFolderPath);
            nextPaths.add(normalized);
            const sessionsByPath = hiddenSessionManager.getAllSessions();
            return {
              hiddenPaths: nextPaths,
              sessionsByPath,
            };
          });

          return SessionToken;
        },
      }),
      persistConfig,
    ),
    { name: "HiddenFoldersStore" },
  ),
);

export function useHiddenFolders(): HiddenFoldersState;
export function useHiddenFolders<T>(
  selector: (state: HiddenFoldersState) => T,
  equalityFn?: (left: T, right: T) => boolean,
): T;
export function useHiddenFolders<T>(
  selector?: (state: HiddenFoldersState) => T,
  equalityFn?: (left: T, right: T) => boolean,
) {
  const selectState = (selector ?? ((state: HiddenFoldersState) => state)) as (
    state: HiddenFoldersState,
  ) => T;
  return useHiddenFoldersStore(selectState, equalityFn ?? shallow);
}
