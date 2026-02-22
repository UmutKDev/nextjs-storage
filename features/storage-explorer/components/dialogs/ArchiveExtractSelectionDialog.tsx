"use client";

import React from "react";
import { Archive } from "lucide-react";
import ConfirmDeleteModal from "@/components/Storage/ConfirmDeleteModal";
import { useExplorerActions } from "../../contexts/ExplorerActionsContext";
import type { CloudObjectModel } from "@/Service/Generates/api";

type ArchiveExtractSelectionDialogProps = {
  open: boolean;
  payload: { files: CloudObjectModel[] } | null;
  onClose: () => void;
};

export default function ArchiveExtractSelectionDialog({
  open,
  payload,
  onClose,
}: ArchiveExtractSelectionDialogProps) {
  const { createArchiveExtractionJob } = useExplorerActions();
  const files = payload?.files ?? [];

  const createExtractionJobs = React.useCallback(async () => {
    if (files.length === 0) return;
    await Promise.all(files.map((file) => createArchiveExtractionJob(file)));
  }, [createArchiveExtractionJob, files]);

  return (
    <ConfirmDeleteModal
      open={open && files.length > 0}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      onConfirm={createExtractionJobs}
      title={`${files.length} arsiv dosyasi cikarilsin mi?`}
      description="Bu islem secilen her arsiv dosyasindan yeni bir klasor olusturur."
      headerLabel="Toplu arsiv cikarma"
      confirmLabel="Tumunu cikar"
      confirmVariant="primary"
      icon={<Archive className="text-primary" />}
      note={null}
    />
  );
}
