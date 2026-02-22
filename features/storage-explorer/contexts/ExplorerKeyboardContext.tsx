"use client";

import React from "react";
import { useExplorerSelection } from "./ExplorerSelectionContext";
import { useExplorerSelectionRange } from "./ExplorerSelectionRangeContext";
import { useExplorerItemNavigation } from "./ExplorerNavigationContext";
import { useExplorerActions } from "./ExplorerActionsContext";
import { useExplorerContextMenu } from "../stores/explorerContextMenu.store";
import { useExplorerQuery } from "./ExplorerQueryContext";
import { useExplorerMove } from "../hooks/useExplorerMove";
import {
  useExplorerClipboard,
  type ExplorerClipboardState,
} from "../hooks/useExplorerClipboard";
import { useHiddenFolders } from "@/components/Storage/stores/hiddenFolders.store";
import type { Directory } from "@/components/storage-browser/types/storage-browser.types";

type ExplorerKeyboardContextValue = {
  selectionAnchorKey: string | null;
  clipboardState: ExplorerClipboardState;
  registerKeyListeners: () => void;
  unregisterKeyListeners: () => void;
};

const ExplorerKeyboardContext =
  React.createContext<ExplorerKeyboardContextValue | null>(null);

export function ExplorerKeyboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    selectedItemKeys,
    replaceSelectedItemKeys,
    clearSelection,
    selectAllVisibleItems,
  } = useExplorerSelection();
  const { orderedKeys, orderedItemByKey, replaceSelectionRange, getActiveKey } =
    useExplorerSelectionRange();
  const { openItemByKey, renameItemByKey } = useExplorerItemNavigation();
  const { deleteSelection } = useExplorerActions();
  const { closeContextMenu } = useExplorerContextMenu();
  const { currentPath } = useExplorerQuery();
  const { updateItemsLocation } = useExplorerMove();
  const { clipboardState, setClipboardState, clearClipboard } =
    useExplorerClipboard();
  const [selectionAnchorKey, setSelectionAnchorKey] = React.useState<
    string | null
  >(null);
  const isListenerRegisteredRef = React.useRef(false);
  const lastShiftUpRef = React.useRef<number>(0);
  const { promptReveal } = useHiddenFolders((state) => ({
    promptReveal: state.promptReveal,
  }));

  React.useEffect(() => {
    if (selectedItemKeys.size === 0) {
      setSelectionAnchorKey(null);
      return;
    }
    let lastSelected: string | null = null;
    orderedKeys.forEach((key) => {
      if (selectedItemKeys.has(key)) lastSelected = key;
    });
    if (lastSelected) setSelectionAnchorKey(lastSelected);
  }, [orderedKeys, selectedItemKeys]);

  const isEditableTarget = React.useCallback((target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    const tagName = target.tagName.toLowerCase();
    return (
      tagName === "input" ||
      tagName === "textarea" ||
      tagName === "select" ||
      target.isContentEditable
    );
  }, []);

  const handleKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      if (event.defaultPrevented || isEditableTarget(event.target)) return;
      if (orderedKeys.length === 0) return;

      const isCtrlOrCmd = event.metaKey || event.ctrlKey;

      if (isCtrlOrCmd && event.key.toLowerCase() === "a") {
        event.preventDefault();
        selectAllVisibleItems(orderedKeys);
        setSelectionAnchorKey(orderedKeys[orderedKeys.length - 1] ?? null);
        return;
      }

      if (event.key === "Escape") {
        closeContextMenu();
        clearSelection();
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedItemKeys.size > 0) {
          event.preventDefault();
          deleteSelection(selectedItemKeys.size);
        }
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        if (selectedItemKeys.size > 0) {
          event.preventDefault();
          const activeKey = selectionAnchorKey ?? getActiveKey();
          if (activeKey) openItemByKey(activeKey);
        }
        return;
      }

      if (event.key === "F2") {
        if (selectedItemKeys.size === 1) {
          event.preventDefault();
          const activeKey = selectionAnchorKey ?? getActiveKey();
          if (activeKey) renameItemByKey(activeKey);
        }
        return;
      }

      if (isCtrlOrCmd && event.key.toLowerCase() === "c") {
        if (selectedItemKeys.size > 0) {
          event.preventDefault();
          setClipboardState({
            keys: Array.from(selectedItemKeys),
            mode: "copy",
          });
        }
        return;
      }

      if (isCtrlOrCmd && event.key.toLowerCase() === "x") {
        if (selectedItemKeys.size > 0) {
          event.preventDefault();
          setClipboardState({
            keys: Array.from(selectedItemKeys),
            mode: "cut",
          });
        }
        return;
      }

      if (isCtrlOrCmd && event.key.toLowerCase() === "v") {
        if (!clipboardState?.keys.length) return;
        event.preventDefault();
        if (clipboardState.mode === "copy") {
          // Copy is not supported yet
          return;
        }
        const activeKey = selectionAnchorKey ?? getActiveKey();
        const activeEntry = activeKey ? orderedItemByKey.get(activeKey) : null;
        const destinationKey =
          activeEntry?.type === "folder"
            ? ((activeEntry.item as Directory).Prefix ?? currentPath ?? "")
            : (currentPath ?? "");
        void updateItemsLocation(clipboardState.keys, destinationKey).then(
          (moved) => {
            if (moved) clearClipboard();
          },
        );
        return;
      }

      const arrowKeys = new Set([
        "ArrowDown",
        "ArrowUp",
        "ArrowLeft",
        "ArrowRight",
      ]);
      if (arrowKeys.has(event.key)) {
        event.preventDefault();
        const direction =
          event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
        const activeKey = selectionAnchorKey ?? getActiveKey();
        const currentIndex = activeKey ? orderedKeys.indexOf(activeKey) : -1;
        const nextIndex = Math.min(
          Math.max(currentIndex + direction, 0),
          orderedKeys.length - 1,
        );
        const nextKey = orderedKeys[nextIndex];
        if (!nextKey) return;

        if (event.shiftKey) {
          const anchorKey = selectionAnchorKey ?? activeKey ?? nextKey;
          replaceSelectionRange(anchorKey, nextKey);
        } else {
          replaceSelectedItemKeys(new Set([nextKey]));
          setSelectionAnchorKey(nextKey);
        }
      }
    },
    [
      clearClipboard,
      clearSelection,
      clipboardState,
      closeContextMenu,
      currentPath,
      deleteSelection,
      getActiveKey,
      isEditableTarget,
      openItemByKey,
      orderedItemByKey,
      orderedKeys,
      renameItemByKey,
      replaceSelectedItemKeys,
      replaceSelectionRange,
      selectAllVisibleItems,
      selectedItemKeys,
      selectionAnchorKey,
      setClipboardState,
      updateItemsLocation,
    ],
  );

  const handleKeyUp = React.useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== "Shift") return;
      if (isEditableTarget(event.target)) return;

      const now = Date.now();
      const elapsed = now - lastShiftUpRef.current;
      lastShiftUpRef.current = now;

      if (elapsed > 50 && elapsed < 400) {
        lastShiftUpRef.current = 0;
        promptReveal({ path: currentPath || "", label: "bu dizin" });
      }
    },
    [currentPath, isEditableTarget, promptReveal],
  );

  const registerKeyListeners = React.useCallback(() => {
    if (isListenerRegisteredRef.current) return;
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    isListenerRegisteredRef.current = true;
  }, [handleKeyDown, handleKeyUp]);

  const unregisterKeyListeners = React.useCallback(() => {
    if (!isListenerRegisteredRef.current) return;
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    isListenerRegisteredRef.current = false;
  }, [handleKeyDown, handleKeyUp]);

  React.useEffect(() => {
    registerKeyListeners();
    return () => unregisterKeyListeners();
  }, [registerKeyListeners, unregisterKeyListeners]);

  const value = React.useMemo<ExplorerKeyboardContextValue>(
    () => ({
      selectionAnchorKey,
      clipboardState,
      registerKeyListeners,
      unregisterKeyListeners,
    }),
    [
      clipboardState,
      registerKeyListeners,
      selectionAnchorKey,
      unregisterKeyListeners,
    ],
  );

  return (
    <ExplorerKeyboardContext.Provider value={value}>
      {children}
    </ExplorerKeyboardContext.Provider>
  );
}

export { ExplorerKeyboardContext };
