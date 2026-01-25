"use client";

import React from "react";
import BaseFileUploadModal from "@/components/Storage/FileUploadModal";

type UploadFilesDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function UploadFilesDialog({
  open,
  onClose,
}: UploadFilesDialogProps) {
  return <BaseFileUploadModal open={open} onClose={onClose} />;
}
