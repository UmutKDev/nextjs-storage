"use client";

import React, { Suspense } from "react";
import StorageProvider from "@/components/Storage/StorageProvider";
import EncryptedFoldersProvider from "@/components/Storage/EncryptedFoldersProvider";
import HiddenFoldersProvider from "@/components/Storage/HiddenFoldersProvider";
import WorkspaceSync from "@/features/teams/components/WorkspaceSync";

export default function StorageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <StorageProvider>
        <WorkspaceSync />
        <EncryptedFoldersProvider>
          <HiddenFoldersProvider>{children}</HiddenFoldersProvider>
        </EncryptedFoldersProvider>
      </StorageProvider>
    </Suspense>
  );
}
