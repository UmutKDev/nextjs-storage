"use client";

import React from "react";
import EditFileModal from "@/components/Storage/EditFileModal";
import type { CloudObjectModel } from "@/Service/Generates/api";

type EditFileDialogProps = {
  open: boolean;
  payload: { file: CloudObjectModel } | null;
  onClose: () => void;
};

export default function EditFileDialog({
  open,
  payload,
  onClose,
}: EditFileDialogProps) {
  return (
    <EditFileModal
      open={open}
      file={payload?.file ?? null}
      onClose={onClose}
      onConfirm={async () => {
        onClose();
      }}
    />
  );
}
