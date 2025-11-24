"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

type StorageContextType = {
  currentPath: string; // path used as query param for cloudApiFactory.list
  setCurrentPath: (path: string) => void;
  reset: () => void;
};

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export function useStorage() {
  const ctx = useContext(StorageContext);
  if (!ctx) throw new Error("useStorage must be used inside a StorageProvider");
  return ctx;
}

export default function StorageProvider({
  children,
  initialPath = "",
}: React.PropsWithChildren<{ initialPath?: string }>) {
  const [currentPath, setCurrentPathRaw] = useState<string>(initialPath);

  const queryClient = useQueryClient();

  const setCurrentPath = useCallback(
    (path: string) => {
      // normalize empty / root to empty string
      const normalized =
        !path || path === "/" ? "" : path.replace(/^\/+|\/+$/g, "");
      setCurrentPathRaw(normalized);

      // Ensure we refetch for this path so navigating back always hits the API
      try {
        queryClient.invalidateQueries({
          predicate: (q) =>
            Array.isArray(q.queryKey) &&
            q.queryKey[0] === "cloud" &&
            q.queryKey[1] === "list" &&
            q.queryKey[2] === normalized,
        });
      } catch {
        // ignore in environments where query client isn't available
      }
    },
    [queryClient]
  );

  const reset = useCallback(() => setCurrentPathRaw(""), []);

  return (
    <StorageContext.Provider value={{ currentPath, setCurrentPath, reset }}>
      {children}
    </StorageContext.Provider>
  );
}
