"use client";

import React from "react";

export type ExplorerClipboardState = {
  keys: string[];
  mode: "copy" | "cut";
} | null;

export function useExplorerClipboard() {
  const [clipboardState, setClipboardState] =
    React.useState<ExplorerClipboardState>(null);

  const clearClipboard = React.useCallback(() => {
    setClipboardState(null);
  }, []);

  return { clipboardState, setClipboardState, clearClipboard };
}
