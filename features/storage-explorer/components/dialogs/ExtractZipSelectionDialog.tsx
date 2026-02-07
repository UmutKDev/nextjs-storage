"use client";

import React from "react";
import { Archive } from "lucide-react";
import ConfirmDeleteModal from "@/components/Storage/ConfirmDeleteModal";
import { useExplorerActions } from "../../contexts/ExplorerActionsContext";
import type { CloudObjectModel } from "@/Service/Generates/api";

type ExtractZipSelectionDialogProps = {
  open: boolean;
  payload: { files: CloudObjectModel[] } | null;
  onClose: () => void;
};

export default function ExtractZipSelectionDialog({
  open,
  payload,
  onClose,
}: ExtractZipSelectionDialogProps) {
  const { createZipExtractionJob } = useExplorerActions();
  const files = payload?.files ?? [];

  const createExtractionJobs = React.useCallback(async () => {
    if (files.length === 0) return;
    await Promise.all(files.map((file) => createZipExtractionJob(file)));
  }, [createZipExtractionJob, files]);

  return (
    <ConfirmDeleteModal
      open={open && files.length > 0}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      onConfirm={createExtractionJobs}
      title={`${files.length} zip dosyasi cikarilsin mi?`}
      description="Bu islem secilen her zip dosyasindan yeni bir klasor olusturur."
      headerLabel="Toplu zip cikarma"
      confirmLabel="Tümünü çıkar"
      confirmVariant="primary"
      icon={<Archive className="text-primary" />}
      note={null}
    />
  );
}
