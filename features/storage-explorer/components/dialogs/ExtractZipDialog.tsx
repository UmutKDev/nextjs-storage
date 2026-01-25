"use client";

import React from "react";
import { Archive } from "lucide-react";
import ConfirmDeleteModal from "@/components/Storage/ConfirmDeleteModal";
import { useExplorerExtractZip } from "../../hooks/useExplorerExtractZip";
import type { CloudObjectModel } from "@/Service/Generates/api";

type ExtractZipDialogProps = {
  open: boolean;
  payload: { file: CloudObjectModel } | null;
  onClose: () => void;
};

export default function ExtractZipDialog({
  open,
  payload,
  onClose,
}: ExtractZipDialogProps) {
  const { createZipExtractionJob, getFileDisplayName } = useExplorerExtractZip();
  const file = payload?.file ?? null;

  const createExtractionJob = React.useCallback(async () => {
    if (!file) return;
    await createZipExtractionJob(file);
  }, [createZipExtractionJob, file]);

  return (
    <ConfirmDeleteModal
      open={open && Boolean(file)}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      onConfirm={createExtractionJob}
      title={`Zip cikarilsin mi: ${file ? getFileDisplayName(file) : ""}?`}
      description="Bu islem zip dosyasindan yeni bir klasor olusturur."
      headerLabel="Extract zip"
      confirmLabel="Extract"
      confirmVariant="primary"
      icon={<Archive className="text-primary" />}
      note={null}
    />
  );
}
