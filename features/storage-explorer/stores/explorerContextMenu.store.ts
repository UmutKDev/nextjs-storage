"use client";

import React from "react";
import { createWithEqualityFn } from "zustand/traditional";
import { devtools } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import type {
  CloudObject,
  Directory,
} from "@/components/storage-browser/types/storage-browser.types";
import { useExplorerSelection } from "../contexts/ExplorerSelectionContext";

type ContextMenuState = {
  x: number;
  y: number;
  key: string;
  type: "file" | "folder";
};

type ExplorerContextMenuStore = {
  contextMenuState: ContextMenuState | null;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  setContextMenuState: (state: ContextMenuState | null) => void;
};

export const useExplorerContextMenuStore =
  createWithEqualityFn<ExplorerContextMenuStore>()(
    devtools(
      (set) => ({
        contextMenuState: null,
        scrollContainerRef: React.createRef<HTMLDivElement>(),
        setContextMenuState: (state) => set({ contextMenuState: state }),
      }),
      { name: "ExplorerContextMenuStore" },
    ),
  );

export function useExplorerContextMenu() {
  const { contextMenuState, scrollContainerRef, setContextMenuState } =
    useExplorerContextMenuStore(
      (state) => ({
        contextMenuState: state.contextMenuState,
        scrollContainerRef: state.scrollContainerRef,
        setContextMenuState: state.setContextMenuState,
      }),
      shallow,
    );
  const { selectedItemKeys, replaceSelectedItemKeys } = useExplorerSelection();

  const closeContextMenu = React.useCallback(() => {
    setContextMenuState(null);
  }, [setContextMenuState]);

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
    [replaceSelectedItemKeys, scrollContainerRef, selectedItemKeys, setContextMenuState],
  );

  return {
    contextMenuState,
    openContextMenu,
    closeContextMenu,
    scrollContainerRef,
  };
}

export function ExplorerContextMenuEffects() {
  const { contextMenuState, closeContextMenu, scrollContainerRef } =
    useExplorerContextMenu();

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
  }, [closeContextMenu, contextMenuState, scrollContainerRef]);

  return null;
}
