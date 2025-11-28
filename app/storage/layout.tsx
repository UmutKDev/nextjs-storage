"use client";

import React, { Suspense } from "react";
import StorageProvider from "@/components/Storage/StorageProvider";

export default function StorageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <StorageProvider>{children}</StorageProvider>
    </Suspense>
  );
}
