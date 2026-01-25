"use client";

import React from "react";
import MoveFileModal from "@/components/Storage/MoveFileModal";
import { useExplorerMove } from "../../hooks/useExplorerMove";
import { useExplorerQuery } from "../../contexts/ExplorerQueryContext";

type MoveItemsDialogProps = {
  open: boolean;
  payload: { items: string[] } | null;
  onClose: () => void;
};

export default function MoveItemsDialog({
  open,
  payload,
  onClose,
}: MoveItemsDialogProps) {
  const { updateItemsLocation } = useExplorerMove();
  const { currentPath } = useExplorerQuery();

  return (
    <MoveFileModal
      open={open}
      onClose={onClose}
      sourceKeys={payload?.items ?? []}
      onMove={updateItemsLocation}
      initialPath={currentPath}
    />
  );
}
