"use client";

import React, { Suspense } from "react";
import StorageProvider from "@/components/Storage/StorageProvider";
import EncryptedFoldersProvider from "@/components/Storage/EncryptedFoldersProvider";

export default function StorageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <StorageProvider>
        <EncryptedFoldersProvider>{children}</EncryptedFoldersProvider>
      </StorageProvider>
    </Suspense>
  );
}
