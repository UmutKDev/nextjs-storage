"use client";

import React from "react";
import ConfirmMoveDragModal from "@/components/Storage/ConfirmMoveDragModal";
import { useExplorerMove } from "../../hooks/useExplorerMove";

type ConfirmMoveDragDialogProps = {
  open: boolean;
  payload: {
    sourceKeys: string[];
    targetKey: string;
    sourceName?: string;
    targetName?: string;
  } | null;
  onClose: () => void;
};

export default function ConfirmMoveDragDialog({
  open,
  payload,
  onClose,
}: ConfirmMoveDragDialogProps) {
  const { updateItemsLocation } = useExplorerMove();

  const updateDraggedItemLocation = React.useCallback(async () => {
    if (!payload) return;
    await updateItemsLocation(payload.sourceKeys, payload.targetKey);
  }, [payload, updateItemsLocation]);

  return (
    <ConfirmMoveDragModal
      open={open && Boolean(payload)}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      title={`Move: ${payload?.sourceName ?? ""}`}
      description={`Are you sure you want to move "${
        payload?.sourceName ?? ""
      }" to "${payload?.targetName ?? ""}"?`}
      onConfirm={updateDraggedItemLocation}
    />
  );
}
