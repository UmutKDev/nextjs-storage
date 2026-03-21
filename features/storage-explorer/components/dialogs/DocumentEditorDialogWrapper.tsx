"use client";

import React from "react";
import { DocumentEditorDialog } from "@/features/document-editor";
import { useExplorerQuery } from "../../contexts/ExplorerQueryContext";
import { useDialogs } from "../../contexts/DialogsContext";
import type { CloudObjectModel } from "@/Service/Generates/api";

type Props = {
  open: boolean;
  payload: { file: CloudObjectModel } | null;
  onClose: () => void;
};

export default function DocumentEditorDialogWrapper({
  open,
  payload,
  onClose,
}: Props) {
  const { invalidateObjects } = useExplorerQuery();
  const { openDialog } = useDialogs();

  const handleRestored = React.useCallback(async () => {
    await invalidateObjects();
  }, [invalidateObjects]);

  const handleDelete = React.useCallback(
    (file: CloudObjectModel) => {
      openDialog("delete-item", { item: file });
    },
    [openDialog],
  );

  return (
    <DocumentEditorDialog
      open={open}
      payload={payload}
      onClose={onClose}
      onDelete={handleDelete}
      onRestored={handleRestored}
    />
  );
}
