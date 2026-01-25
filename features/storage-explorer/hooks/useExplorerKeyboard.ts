"use client";

import React from "react";
import { ExplorerKeyboardContext } from "../contexts/ExplorerKeyboardContext";

export function useExplorerKeyboard() {
  const context = React.useContext(ExplorerKeyboardContext);
  if (!context) {
    throw new Error(
      "useExplorerKeyboard must be used within ExplorerKeyboardProvider"
    );
  }
  return context;
}
