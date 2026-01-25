"use client";

import React from "react";
import ConfirmDeleteModal from "@/components/Storage/ConfirmDeleteModal";
import { useExplorerDelete } from "../../hooks/useExplorerDelete";

export default function DeleteConfirmModal() {
  const {
    itemPendingDeletion,
    setItemPendingDeletion,
    deleteItem,
    getItemDisplayName,
  } = useExplorerDelete();

  const deletePendingItem = React.useCallback(async () => {
    if (itemPendingDeletion) await deleteItem(itemPendingDeletion);
  }, [deleteItem, itemPendingDeletion]);

  return (
    <ConfirmDeleteModal
      open={Boolean(itemPendingDeletion)}
      onOpenChange={(open) => {
        if (!open) setItemPendingDeletion(null);
      }}
      onConfirm={deletePendingItem}
      title={`Delete ${
        itemPendingDeletion ? getItemDisplayName(itemPendingDeletion) : ""
      }?`}
      description="This action cannot be undone."
    />
  );
}
