"use client";

import React from "react";
import { Archive } from "lucide-react";
import ConfirmDeleteModal from "@/components/Storage/ConfirmDeleteModal";
import { useExplorerExtractZip } from "../../hooks/useExplorerExtractZip";

export default function ExtractZipModal() {
  const {
    filePendingExtraction,
    setFilePendingExtraction,
    createZipExtractionJob,
    getFileDisplayName,
  } = useExplorerExtractZip();

  const createExtractionJob = React.useCallback(async () => {
    if (filePendingExtraction) {
      await createZipExtractionJob(filePendingExtraction);
    }
  }, [createZipExtractionJob, filePendingExtraction]);

  return (
    <ConfirmDeleteModal
      open={Boolean(filePendingExtraction)}
      onOpenChange={(open) => {
        if (!open) setFilePendingExtraction(null);
      }}
      onConfirm={createExtractionJob}
      title={`Zip cikarilsin mi: ${
        filePendingExtraction ? getFileDisplayName(filePendingExtraction) : ""
      }?`}
      description="Bu islem zip dosyasindan yeni bir klasor olusturur."
      headerLabel="Extract zip"
      confirmLabel="Extract"
      confirmVariant="primary"
      icon={<Archive className="text-primary" />}
      note={null}
    />
  );
}
