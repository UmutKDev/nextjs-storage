"use client";

import React from "react";
import ConfirmDeleteModal from "@/components/Storage/ConfirmDeleteModal";
import { useExplorerDelete } from "../../hooks/useExplorerDelete";

type DeleteSelectionDialogProps = {
  open: boolean;
  payload: { count: number } | null;
  onClose: () => void;
};

export default function DeleteSelectionDialog({
  open,
  payload,
  onClose,
}: DeleteSelectionDialogProps) {
  const { deleteSelectedItems } = useExplorerDelete();
  const count = payload?.count ?? 0;

  const handleConfirm = React.useCallback(async () => {
    if (count === 0) return;
    await deleteSelectedItems({ skipConfirm: true });
  }, [count, deleteSelectedItems]);

  return (
    <ConfirmDeleteModal
      open={open && count > 0}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      onConfirm={handleConfirm}
      title={`Delete ${count} item${count === 1 ? "" : "s"}?`}
      description="This action cannot be undone."
    />
  );
}
