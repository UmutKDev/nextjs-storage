"use client";

import React from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { getFolderNameFromPrefix } from "../utils/path";
import { useDialogs } from "./DialogsContext";

type ExplorerDnDContextValue = {
  activeDraggedItemKey: string | null;
  startDragTracking: (event: DragStartEvent) => void;
  finalizeDragTracking: (event: DragEndEvent) => void;
};

const ExplorerDnDContext = React.createContext<ExplorerDnDContextValue | null>(
  null
);

export function ExplorerDnDProvider({ children }: { children: React.ReactNode }) {
  const [activeDraggedItemKey, setActiveDraggedItemKey] = React.useState<
    string | null
  >(null);
  const { openDialog } = useDialogs();
  const startDragTracking = React.useCallback((event: DragStartEvent) => {
    setActiveDraggedItemKey(event.active.id as string);
  }, []);

  const finalizeDragTracking = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDraggedItemKey(null);

      if (!over) return;

      const sourceId = active.id as string;
      const targetId = over.id as string;

      if (sourceId === targetId) return;

      const sourceData = active.data.current;
      const isSourceFolder = sourceData?.type === "folder";

      let targetFolder = targetId.replace(/^\/+/, "");
      if (targetFolder && !targetFolder.endsWith("/")) {
        targetFolder += "/";
      }

      let currentParent = "";
      if (isSourceFolder) {
        const noSlash = sourceId.slice(0, -1);
        const lastSlash = noSlash.lastIndexOf("/");
        currentParent =
          lastSlash === -1 ? "" : noSlash.substring(0, lastSlash + 1);
      } else {
        const lastSlash = sourceId.lastIndexOf("/");
        currentParent =
          lastSlash === -1 ? "" : sourceId.substring(0, lastSlash + 1);
      }

      if (currentParent === targetFolder) return;

      const destinationKey = targetFolder === "" ? "/" : targetFolder;

      openDialog("confirm-move-drag", {
        sourceKeys: [sourceId],
        targetKey: destinationKey,
        sourceName: isSourceFolder
          ? getFolderNameFromPrefix(sourceId)
          : sourceId.split("/").pop(),
        targetName:
          targetFolder === "" || targetFolder === "/"
            ? "Ana Dizin"
            : getFolderNameFromPrefix(targetFolder),
      });
    },
    [openDialog]
  );

  const value = React.useMemo<ExplorerDnDContextValue>(
    () => ({
      activeDraggedItemKey,
      startDragTracking,
      finalizeDragTracking,
    }),
    [activeDraggedItemKey, finalizeDragTracking, startDragTracking]
  );

  return (
    <ExplorerDnDContext.Provider value={value}>
      {children}
    </ExplorerDnDContext.Provider>
  );
}

export function useExplorerDnD() {
  const context = React.useContext(ExplorerDnDContext);
  if (!context) {
    throw new Error("useExplorerDnD must be used within ExplorerDnDProvider");
  }
  return context;
}
