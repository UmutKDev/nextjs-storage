"use client";

import React, { Suspense } from "react";
import StorageProvider from "@/components/Storage/StorageProvider";
import EncryptedFoldersProvider from "@/components/Storage/EncryptedFoldersProvider";
import HiddenFoldersProvider from "@/components/Storage/HiddenFoldersProvider";

export default function StorageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <StorageProvider>
        <EncryptedFoldersProvider>
          <HiddenFoldersProvider>{children}</HiddenFoldersProvider>
        </EncryptedFoldersProvider>
      </StorageProvider>
    </Suspense>
  );
}
