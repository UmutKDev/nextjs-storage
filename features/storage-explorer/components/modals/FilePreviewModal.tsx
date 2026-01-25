"use client";

import React from "react";
import BaseFilePreviewModal from "@/components/Storage/FilePreviewModal";
import { useExplorerUI } from "../../contexts/ExplorerUIContext";
import { useExplorerFiltering } from "../../hooks/useExplorerFiltering";
import { useExplorerDelete } from "../../hooks/useExplorerDelete";

export default function FilePreviewModal() {
  const { activePreviewFile, setActivePreviewFile } = useExplorerUI();
  const { filteredObjectItems } = useExplorerFiltering();
  const { setItemPendingDeletion } = useExplorerDelete();

  return (
    <BaseFilePreviewModal
      file={activePreviewFile}
      onClose={() => setActivePreviewFile(null)}
      files={filteredObjectItems}
      onChange={setActivePreviewFile}
      onDelete={(file) => {
        setActivePreviewFile(null);
        setItemPendingDeletion(file);
      }}
    />
  );
}
