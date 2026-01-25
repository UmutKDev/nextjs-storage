"use client";

import React from "react";
import BaseFileUploadModal from "@/components/Storage/FileUploadModal";
import { useExplorerUI } from "../../contexts/ExplorerUIContext";

export default function FileUploadModal() {
  const { isUploadModalOpen, setIsUploadModalOpen } = useExplorerUI();

  return (
    <BaseFileUploadModal
      open={isUploadModalOpen}
      onClose={() => setIsUploadModalOpen(false)}
    />
  );
}
