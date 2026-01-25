"use client";

import React from "react";
import ConfirmMoveDragModal from "@/components/Storage/ConfirmMoveDragModal";
import { useExplorerDnD } from "../../contexts/ExplorerDnDContext";
import { useExplorerMove } from "../../hooks/useExplorerMove";

export default function DragMoveConfirmModal() {
  const { pendingMoveConfirmation, setPendingMoveConfirmation } =
    useExplorerDnD();
  const { updateItemsLocation } = useExplorerMove();

  const updateDraggedItemLocation = React.useCallback(async () => {
    if (pendingMoveConfirmation) {
      await updateItemsLocation(
        pendingMoveConfirmation.sourceKeys,
        pendingMoveConfirmation.targetKey
      );
      setPendingMoveConfirmation(null);
    }
  }, [pendingMoveConfirmation, setPendingMoveConfirmation, updateItemsLocation]);

  return (
    <ConfirmMoveDragModal
      open={Boolean(pendingMoveConfirmation)}
      onOpenChange={(open) => !open && setPendingMoveConfirmation(null)}
      title={`Taşı: ${pendingMoveConfirmation?.sourceName}`}
      description={`"${pendingMoveConfirmation?.sourceName}" öğesini "${pendingMoveConfirmation?.targetName}" klasörüne taşımak istediğinizden emin misiniz?`}
      onConfirm={updateDraggedItemLocation}
    />
  );
}
