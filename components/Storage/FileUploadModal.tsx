"use client";

import React from "react";
import FileUpload from "./FileUpload";
import { X } from "lucide-react";
import BaseDialog from "./BaseDialog";

export default function FileUploadModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <BaseDialog
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && onClose()}
      panelClassName="relative z-10 w-[96vw] max-w-5xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden max-h-[calc(100vh-4rem)] flex flex-col"
    >
      <div className="flex items-center justify-between p-5 border-b border-muted/10 shrink-0">
        <div className="space-y-0.5">
          <div className="text-sm text-muted-foreground">Storage</div>
          <div className="text-base font-semibold">Upload files</div>
        </div>
        <button onClick={onClose} className="rounded-md p-1.5 hover:bg-muted/10">
          <X />
        </button>
      </div>

      <div className="p-5 overflow-auto flex-1">
        <FileUpload />
      </div>
    </BaseDialog>
  );
}
