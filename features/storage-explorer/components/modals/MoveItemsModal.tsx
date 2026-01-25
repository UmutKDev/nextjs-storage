"use client";

import React from "react";
import MoveFileModal from "@/components/Storage/MoveFileModal";
import { useExplorerFolderActions } from "../../hooks/useExplorerFolderActions";
import { useExplorerMove } from "../../hooks/useExplorerMove";
import { useExplorerQuery } from "../../contexts/ExplorerQueryContext";

export default function MoveItemsModal() {
  const {
    isMoveItemsModalOpen,
    setIsMoveItemsModalOpen,
    moveSourceKeys,
  } = useExplorerFolderActions();
  const { updateItemsLocation } = useExplorerMove();
  const { currentPath } = useExplorerQuery();

  return (
    <MoveFileModal
      open={isMoveItemsModalOpen}
      onClose={() => setIsMoveItemsModalOpen(false)}
      sourceKeys={moveSourceKeys}
      onMove={updateItemsLocation}
      initialPath={currentPath}
    />
  );
}
