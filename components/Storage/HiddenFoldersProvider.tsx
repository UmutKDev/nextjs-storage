"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { isAxiosError } from "axios";

import RevealHiddenFolderModal from "./RevealHiddenFolderModal";
import { hiddenSessionManager } from "@/lib/SessionManager";
import { useHiddenFolders } from "./stores/hiddenFolders.store";
import { useQueryClient } from "@tanstack/react-query";
import { CLOUD_DIRECTORIES_QUERY_KEY } from "@/hooks/useCloudList";

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

export default function HiddenFoldersProvider({
  children,
}: React.PropsWithChildren) {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const {
    revealPrompt,
    setRevealPrompt,
    revealFolder,
    clearAllSessions,
    syncSessions,
  } = useHiddenFolders((state) => ({
    revealPrompt: state.revealPrompt,
    setRevealPrompt: state.setRevealPrompt,
    revealFolder: state.revealFolder,
    clearAllSessions: state.clearAllSessions,
    syncSessions: state.syncSessions,
  }));

  React.useEffect(() => {
    syncSessions(hiddenSessionManager.getAllSessions());
    const handleSessionChange = (
      sessions: Record<string, { token: string; expiresAt: number }>,
    ) => {
      syncSessions({ ...sessions });
    };
    hiddenSessionManager.on("change", handleSessionChange);
    return () => {
      hiddenSessionManager.off("change", handleSessionChange);
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
      const allSessions = hiddenSessionManager.getAllSessions();

      Object.entries(allSessions).forEach(([path, session]) => {
        if (session.expiresAt < now) {
          hiddenSessionManager.clearSession(path);

          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("hidden-session-expired", {
                detail: { path },
              }),
            );
          }
        }
      });
    };

    const interval = setInterval(checkExpiry, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRevealSubmit = React.useCallback(
    async (passphrase: string) => {
      if (!revealPrompt) return;
      try {
        const token = await revealFolder(revealPrompt.path, passphrase);
        revealPrompt.onSuccess?.(token);
        setRevealPrompt(null);
        // Invalidate directory queries so they refetch with the new hidden session token
        await queryClient.invalidateQueries({
          queryKey: CLOUD_DIRECTORIES_QUERY_KEY,
        });
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    [setRevealPrompt, revealFolder, revealPrompt, queryClient],
  );

  return (
    <>
      {children}
      <RevealHiddenFolderModal
        open={Boolean(revealPrompt)}
        folderName={revealPrompt?.displayName}
        onClose={() => setRevealPrompt(null)}
        onSubmit={handleRevealSubmit}
      />
    </>
  );
}
