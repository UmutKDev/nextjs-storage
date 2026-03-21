"use client";

import React from "react";
import BaseDialog from "@/components/Storage/BaseDialog";
import { Button } from "@/components/ui/button";

export default function UnsavedChangesDialog({
  open,
  onSaveAndClose,
  onDiscard,
  onCancel,
}: {
  open: boolean;
  onSaveAndClose: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}) {
  return (
    <BaseDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel();
      }}
      panelClassName="relative z-[60] max-w-sm w-full bg-card border border-border shadow-2xl rounded-xl p-6"
      overlayClassName="absolute inset-0 bg-black/50 backdrop-blur-sm"
      containerClassName="fixed inset-0 z-[60] grid place-items-center p-4"
    >
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground">
          Unsaved Changes
        </h3>
        <p className="text-sm text-muted-foreground">
          You have unsaved changes. Would you like to save before closing?
        </p>
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" size="sm" onClick={onDiscard}>
            Discard
          </Button>
          <Button size="sm" onClick={onSaveAndClose}>
            Save & Close
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
}
