"use client";

import React from "react";

type StorageGridThumbnailContextValue = {
  thumbnailAspectRatioByKey: Record<string, number>;
  onAspectRatioChange: (itemKey: string, aspectRatio: number) => void;
};

const StorageGridThumbnailContext =
  React.createContext<StorageGridThumbnailContextValue | null>(null);

export function StorageGridThumbnailProvider({
  children,
  thumbnailAspectRatioByKey,
  onAspectRatioChange,
}: {
  children: React.ReactNode;
  thumbnailAspectRatioByKey: Record<string, number>;
  onAspectRatioChange: (itemKey: string, aspectRatio: number) => void;
}) {
  const value = React.useMemo(
    () => ({ thumbnailAspectRatioByKey, onAspectRatioChange }),
    [thumbnailAspectRatioByKey, onAspectRatioChange],
  );

  return (
    <StorageGridThumbnailContext.Provider value={value}>
      {children}
    </StorageGridThumbnailContext.Provider>
  );
}

export function useStorageGridThumbnailContext() {
  const context = React.useContext(StorageGridThumbnailContext);
  if (!context) {
    throw new Error(
      "useStorageGridThumbnailContext must be used within StorageGridThumbnailProvider",
    );
  }
  return context;
}
