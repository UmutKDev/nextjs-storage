"use client";

import React from "react";
import type {
  CloudObject,
  Directory,
} from "@/components/storage-browser/types/storage-browser.types";
import { useExplorerSelection } from "./ExplorerSelectionContext";

type ContextMenuState = {
  x: number;
  y: number;
  key: string;
  type: "file" | "folder";
};

type ExplorerContextMenuContextValue = {
  contextMenuState: ContextMenuState | null;
  openContextMenu: (
    item: CloudObject | Directory,
    itemType: "file" | "folder",
    point: { x: number; y: number },
  ) => void;
  closeContextMenu: () => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
};

const ExplorerContextMenuContext =
  React.createContext<ExplorerContextMenuContextValue | null>(null);

export function ExplorerContextMenuProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { selectedItemKeys, replaceSelectedItemKeys } = useExplorerSelection();
  const [contextMenuState, setContextMenuState] =
    React.useState<ContextMenuState | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);

  const closeContextMenu = React.useCallback(() => {
    setContextMenuState(null);
  }, []);

  const openContextMenu = React.useCallback(
    (
      item: CloudObject | Directory,
      itemType: "file" | "folder",
      point: { x: number; y: number },
    ) => {
      const key =
        itemType === "file"
          ? (item as CloudObject).Path?.Key
          : (item as Directory).Prefix;
      if (!key || !scrollContainerRef.current) return;
      if (!selectedItemKeys.has(key)) {
        replaceSelectedItemKeys(new Set([key]));
      }
      const container = scrollContainerRef.current;
      const rect = container.getBoundingClientRect();
      setContextMenuState({
        x: point.x - rect.left + container.scrollLeft,
        y: point.y - rect.top + container.scrollTop,
        key,
        type: itemType,
      });
    },
    [replaceSelectedItemKeys, selectedItemKeys],
  );

  React.useEffect(() => {
    if (!contextMenuState) return;
    const scrollContainer = scrollContainerRef.current;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-context-menu]")) return;
      closeContextMenu();
    };
    const handleScroll = () => closeContextMenu();
    window.addEventListener("mousedown", handlePointerDown);
    scrollContainer?.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      scrollContainer?.removeEventListener("scroll", handleScroll);
    };
  }, [closeContextMenu, contextMenuState]);

  const value = React.useMemo<ExplorerContextMenuContextValue>(
    () => ({
      contextMenuState,
      openContextMenu,
      closeContextMenu,
      scrollContainerRef,
    }),
    [closeContextMenu, contextMenuState, openContextMenu],
  );

  return (
    <ExplorerContextMenuContext.Provider value={value}>
      {children}
    </ExplorerContextMenuContext.Provider>
  );
}

export function useExplorerContextMenu() {
  const context = React.useContext(ExplorerContextMenuContext);
  if (!context) {
    throw new Error(
      "useExplorerContextMenu must be used within ExplorerContextMenuProvider",
    );
  }
  return context;
}

export { ExplorerContextMenuContext };
