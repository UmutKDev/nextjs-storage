"use client";

import React from "react";
import ConfirmMoveDragModal from "@/components/Storage/ConfirmMoveDragModal";
import { useExplorerMove } from "../../hooks/useExplorerMove";

type ConfirmMoveDragDialogProps = {
  open: boolean;
  payload:
    | {
        sourceKeys: string[];
        targetKey: string;
        sourceName?: string;
        targetName?: string;
      }
    | null;
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
      title={`Taşı: ${payload?.sourceName ?? ""}`}
      description={`"${
        payload?.sourceName ?? ""
      }" öğesini "${payload?.targetName ?? ""}" klasörüne taşımak istediğinizden emin misiniz?`}
      onConfirm={updateDraggedItemLocation}
    />
  );
}
