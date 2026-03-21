"use client";

import React from "react";
import DocumentEditorModal from "./DocumentEditorModal";
import type { CloudObjectModel } from "@/Service/Generates/api";

export default function DocumentEditorDialog({
  open,
  payload,
  onClose,
  onDelete,
  onRestored,
}: {
  open: boolean;
  payload: { file: CloudObjectModel } | null;
  onClose: () => void;
  onDelete?: (file: CloudObjectModel) => void;
  onRestored?: () => void;
}) {
  if (!open || !payload) return null;

  return (
    <DocumentEditorModal
      file={payload.file}
      onClose={onClose}
      onDelete={onDelete}
      onRestored={onRestored}
    />
  );
}
