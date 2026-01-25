"use client";

import React from "react";
import FilePreviewModal from "@/components/Storage/FilePreviewModal";
import { useExplorerFiltering } from "../../hooks/useExplorerFiltering";
import { useDialogs } from "../../contexts/DialogsContext";
import type { CloudObjectModel } from "@/Service/Generates/api";

type PreviewFileDialogProps = {
  open: boolean;
  payload: { file: CloudObjectModel } | null;
  onClose: () => void;
};

export default function PreviewFileDialog({
  open,
  payload,
  onClose,
}: PreviewFileDialogProps) {
  const { filteredObjectItems } = useExplorerFiltering();
  const { openDialog } = useDialogs();
  const file = payload?.file ?? null;

  return (
    <FilePreviewModal
      file={open ? file : null}
      files={filteredObjectItems}
      onClose={onClose}
      onChange={(nextFile) => {
        openDialog("preview-file", { file: nextFile });
      }}
      onDelete={(target) => {
        openDialog("delete-item", { item: target });
      }}
    />
  );
}
