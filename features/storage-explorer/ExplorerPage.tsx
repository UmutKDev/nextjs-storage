"use client";

import React from "react";
import { useStorage } from "@/components/Storage/StorageProvider";
import ExplorerLayout from "./components/ExplorerLayout";
import { ExplorerQueryProvider } from "./contexts/ExplorerQueryContext";
import { ExplorerEncryptionProvider } from "./contexts/ExplorerEncryptionContext";
import { ExplorerSelectionProvider } from "./contexts/ExplorerSelectionContext";
import { ExplorerSelectionRangeProvider } from "./contexts/ExplorerSelectionRangeContext";
import { ExplorerNavigationProvider } from "./contexts/ExplorerNavigationContext";
import { ExplorerActionsProvider } from "./contexts/ExplorerActionsContext";
import { ExplorerContextMenuEffects } from "./stores/explorerContextMenu.store";
import { ExplorerKeyboardProvider } from "./contexts/ExplorerKeyboardContext";
import { ExplorerUIProvider } from "./contexts/ExplorerUIContext";
import { ExplorerDnDProvider } from "./contexts/ExplorerDnDContext";
import { ExplorerUploadProvider } from "./contexts/ExplorerUploadContext";
import { DialogsProvider } from "./contexts/DialogsContext";

export default function ExplorerPage() {
  const { currentPath } = useStorage();

  return (
    <ExplorerUIProvider>
      <DialogsProvider>
        <ExplorerQueryProvider currentPath={currentPath}>
          <ExplorerEncryptionProvider>
            <ExplorerSelectionProvider>
              <ExplorerSelectionRangeProvider>
                <ExplorerNavigationProvider>
                  <ExplorerActionsProvider>
                  <ExplorerKeyboardProvider>
                    <ExplorerUploadProvider>
                      <ExplorerDnDProvider>
                        <ExplorerContextMenuEffects />
                        <ExplorerLayout />
                      </ExplorerDnDProvider>
                    </ExplorerUploadProvider>
                  </ExplorerKeyboardProvider>
                  </ExplorerActionsProvider>
                </ExplorerNavigationProvider>
              </ExplorerSelectionRangeProvider>
            </ExplorerSelectionProvider>
          </ExplorerEncryptionProvider>
        </ExplorerQueryProvider>
      </DialogsProvider>
    </ExplorerUIProvider>
  );
}
