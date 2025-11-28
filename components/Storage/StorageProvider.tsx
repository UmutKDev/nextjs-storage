"use client";

import React, { createContext, useContext, useCallback } from "react";
import { useCloudList } from "@/hooks/useCloudList";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentPath = searchParams.get("path") || initialPath;
  const { invalidates } = useCloudList(currentPath);

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

      // Ensure we refetch for this path so navigating back always hits the API
      try {
        invalidates.invalidateBreadcrumb();
        invalidates.invalidateObjects();
        invalidates.invalidateDirectories();
      } catch {
        // ignore in environments where query client isn't available
      }
    },
    [invalidates, searchParams, pathname, router]
  );

  const reset = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("path");
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  return (
    <StorageContext.Provider value={{ currentPath, setCurrentPath, reset }}>
      {children}
    </StorageContext.Provider>
  );
}
