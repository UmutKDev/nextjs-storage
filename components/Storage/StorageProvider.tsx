"use client";

import React, { createContext, useContext, useCallback, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

type StorageContextType = {
  currentPath: string; // path used as query param for cloudApiFactory.list
  setCurrentPath: (path: string) => void;
  reset: () => void;
  isCurrentLocked: boolean;
  setIsCurrentLocked: (locked: boolean) => void;
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isCurrentLocked, setIsCurrentLocked] = useState(false);

  const currentPath = searchParams.get("path") || initialPath;

  const setCurrentPath = useCallback(
    (path: string) => {
      // normalize empty / root to empty string
      const normalized =
        !path || path === "/" ? "" : path.replace(/^\/+|\/+$/g, "");

      const params = new URLSearchParams(searchParams.toString());
      if (normalized) {
        params.set("path", normalized);
      } else {
        params.delete("path");
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  const reset = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("path");
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  return (
    <StorageContext.Provider
      value={{
        currentPath,
        setCurrentPath,
        reset,
        isCurrentLocked,
        setIsCurrentLocked,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
}
