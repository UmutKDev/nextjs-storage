"use client";

import React from "react";
import ConfirmDeleteModal from "@/components/Storage/ConfirmDeleteModal";
import { useExplorerDelete } from "../../hooks/useExplorerDelete";
import type { CloudDirectoryModel, CloudObjectModel } from "@/Service/Generates/api";

type DeleteItemDialogProps = {
  open: boolean;
  payload: { item: CloudObjectModel | CloudDirectoryModel } | null;
  onClose: () => void;
};

export default function DeleteItemDialog({
  open,
  payload,
  onClose,
}: DeleteItemDialogProps) {
  const { deleteItem, getItemDisplayName } = useExplorerDelete();
  const item = payload?.item ?? null;

  const handleConfirm = React.useCallback(async () => {
    if (item) await deleteItem(item);
  }, [deleteItem, item]);

  return (
    <ConfirmDeleteModal
      open={open && Boolean(item)}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      onConfirm={handleConfirm}
      title={`Delete ${item ? getItemDisplayName(item) : ""}?`}
      description="This action cannot be undone."
    />
  );
}
