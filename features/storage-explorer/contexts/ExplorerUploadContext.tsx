"use client";

import React from "react";
import useUserStorageUsage from "@/hooks/useUserStorageUsage";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useExplorerQuery } from "./ExplorerQueryContext";

type ExplorerUploadContextValue = {
  uploadQueue: ReturnType<typeof useFileUpload>["uploads"];
  activeUploads: ReturnType<typeof useFileUpload>["uploads"];
  aggregatedUploadProgress: number;
  isFileDragActive: boolean;
  trackFileDragEnter: (event: React.DragEvent) => void;
  trackFileDragLeave: (event: React.DragEvent) => void;
  trackFileDragOver: (event: React.DragEvent) => void;
  processFileDropEvent: (event: React.DragEvent) => void;
  queueUploadFiles: (files: File[]) => void;
};

const ExplorerUploadContext =
  React.createContext<ExplorerUploadContextValue | null>(null);

const isFileDragEvent = (event: React.DragEvent) =>
  Array.from(event.dataTransfer.types || []).includes("Files");

export function ExplorerUploadProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentPath } = useExplorerQuery();
  const { userStorageUsageQuery } = useUserStorageUsage();
  const maxUploadBytes = userStorageUsageQuery.data?.MaxUploadSizeBytes;
  const { handleFiles, uploads } = useFileUpload(currentPath);
  const [isFileDragActive, setIsFileDragActive] = React.useState(false);
  const fileDragDepthRef = React.useRef(0);

  const queueUploadFiles = React.useCallback(
    (files: File[]) => {
      if (typeof maxUploadBytes === "number") {
        const allowedFiles: File[] = [];
        const rejectedFiles: File[] = [];
        files.forEach((file) => {
          if (file.size <= maxUploadBytes) {
            allowedFiles.push(file);
          } else {
            rejectedFiles.push(file);
          }
        });
        if (rejectedFiles.length > 0) {
          // Files too large: ${rejectedFiles.length} files exceeded max size ${humanFileSize(maxUploadBytes)}
        }
        if (allowedFiles.length > 0) handleFiles(allowedFiles);
      } else {
        handleFiles(files);
      }
    },
    [handleFiles, maxUploadBytes],
  );

  const trackFileDragEnter = React.useCallback((event: React.DragEvent) => {
    if (!isFileDragEvent(event)) return;
    event.preventDefault();
    event.stopPropagation();
    fileDragDepthRef.current += 1;
    setIsFileDragActive(true);
  }, []);

  const trackFileDragLeave = React.useCallback((event: React.DragEvent) => {
    if (!isFileDragEvent(event)) return;
    event.preventDefault();
    event.stopPropagation();
    fileDragDepthRef.current -= 1;
    if (fileDragDepthRef.current <= 0) {
      fileDragDepthRef.current = 0;
      setIsFileDragActive(false);
    }
  }, []);

  const trackFileDragOver = React.useCallback((event: React.DragEvent) => {
    if (!isFileDragEvent(event)) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const processFileDropEvent = React.useCallback(
    (event: React.DragEvent) => {
      if (!isFileDragEvent(event)) return;
      event.preventDefault();
      event.stopPropagation();
      fileDragDepthRef.current = 0;
      setIsFileDragActive(false);

      const droppedFiles = event.dataTransfer.files;
      if (!droppedFiles || droppedFiles.length === 0) return;
      queueUploadFiles(Array.from(droppedFiles));
    },
    [queueUploadFiles],
  );

  const activeUploads = React.useMemo(
    () => uploads.filter((upload) => upload.status === "uploading"),
    [uploads],
  );

  const aggregatedUploadProgress = React.useMemo(() => {
    if (activeUploads.length === 0) return 0;
    const total = activeUploads.reduce(
      (sum, upload) => sum + upload.progress,
      0,
    );
    return Math.round(total / activeUploads.length);
  }, [activeUploads]);

  const value = React.useMemo<ExplorerUploadContextValue>(
    () => ({
      uploadQueue: uploads,
      activeUploads,
      aggregatedUploadProgress,
      isFileDragActive,
      trackFileDragEnter,
      trackFileDragLeave,
      trackFileDragOver,
      processFileDropEvent,
      queueUploadFiles,
    }),
    [
      activeUploads,
      aggregatedUploadProgress,
      isFileDragActive,
      processFileDropEvent,
      queueUploadFiles,
      trackFileDragEnter,
      trackFileDragLeave,
      trackFileDragOver,
      uploads,
    ],
  );

  return (
    <ExplorerUploadContext.Provider value={value}>
      {children}
    </ExplorerUploadContext.Provider>
  );
}

export function useExplorerUpload() {
  const context = React.useContext(ExplorerUploadContext);
  if (!context) {
    throw new Error(
      "useExplorerUpload must be used within ExplorerUploadProvider",
    );
  }
  return context;
}
