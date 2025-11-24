"use client";

import React from "react";
import StorageProvider from "@/components/Storage/StorageProvider";

export default function StorageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StorageProvider>{children}</StorageProvider>;
}
