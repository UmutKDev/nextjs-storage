"use client";

import React from "react";
import { useStorage } from "@/components/Storage/StorageProvider";
import ExplorerLayout from "./components/ExplorerLayout";
import { ExplorerQueryProvider } from "./contexts/ExplorerQueryContext";
import { ExplorerEncryptionProvider } from "./contexts/ExplorerEncryptionContext";
import { ExplorerSelectionProvider } from "./contexts/ExplorerSelectionContext";
import { ExplorerUIProvider } from "./contexts/ExplorerUIContext";
import { ExplorerDnDProvider } from "./contexts/ExplorerDnDContext";
import { ExplorerUploadProvider } from "./contexts/ExplorerUploadContext";

export default function ExplorerPage() {
  const { currentPath } = useStorage();

  return (
    <ExplorerUIProvider>
      <ExplorerQueryProvider currentPath={currentPath}>
        <ExplorerEncryptionProvider>
          <ExplorerSelectionProvider>
            <ExplorerUploadProvider>
              <ExplorerDnDProvider>
                <ExplorerLayout />
              </ExplorerDnDProvider>
            </ExplorerUploadProvider>
          </ExplorerSelectionProvider>
        </ExplorerEncryptionProvider>
      </ExplorerQueryProvider>
    </ExplorerUIProvider>
  );
}
