"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

import UnlockEncryptedFolderModal from "./UnlockEncryptedFolderModal";
import { sessionManager } from "@/lib/SessionManager";
import { useEncryptedFolders } from "./stores/encryptedFolders.store";

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

export default function EncryptedFoldersProvider({
  children,
}: React.PropsWithChildren) {
  const { status } = useSession();
  const {
    unlockPrompt,
    setUnlockPrompt,
    unlockFolder,
    clearAllSessions,
    syncSessions,
  } = useEncryptedFolders(
    (state) => ({
      unlockPrompt: state.unlockPrompt,
      setUnlockPrompt: state.setUnlockPrompt,
      unlockFolder: state.unlockFolder,
      clearAllSessions: state.clearAllSessions,
      syncSessions: state.syncSessions,
    }),
  );

  React.useEffect(() => {
    syncSessions(sessionManager.getAllSessions());
    const handleSessionChange = (
      sessions: Record<string, { token: string; expiresAt: number }>,
    ) => {
      syncSessions({ ...sessions });
    };
    sessionManager.on("change", handleSessionChange);
    return () => {
      sessionManager.off("change", handleSessionChange);
    };
  }, [syncSessions]);

  React.useEffect(() => {
    if (status === "unauthenticated") {
      clearAllSessions();
    }
  }, [status, clearAllSessions]);

  React.useEffect(() => {
    const checkExpiry = () => {
      const now = Date.now() / 1000;
      const allSessions = sessionManager.getAllSessions();

      Object.entries(allSessions).forEach(([path, session]) => {
        if (session.expiresAt < now) {
          sessionManager.clearSession(path);

          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("session-expired", { detail: { path } }),
            );
          }
          toast.error(`Session expired for ${path}`);
        }
      });
    };

    const interval = setInterval(checkExpiry, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUnlockSubmit = React.useCallback(
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
    [setUnlockPrompt, unlockFolder, unlockPrompt],
  );

  return (
    <>
      {children}
      <UnlockEncryptedFolderModal
        open={Boolean(unlockPrompt)}
        folderName={unlockPrompt?.displayName}
        onClose={() => setUnlockPrompt(null)}
        onSubmit={handleUnlockSubmit}
      />
    </>
  );
}
