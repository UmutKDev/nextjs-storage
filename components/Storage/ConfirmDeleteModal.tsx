"use client";

import React, { useCallback } from "react";
import { X, Trash2 } from "lucide-react";
import BaseDialog from "./BaseDialog";

export default function ConfirmDeleteModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  headerLabel = "Delete item",
  confirmLabel = "Delete",
  confirmVariant = "destructive",
  icon,
  note,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => Promise<void> | void;
  headerLabel?: string;
  confirmLabel?: string;
  confirmVariant?: "destructive" | "primary";
  icon?: React.ReactNode;
  note?: string | null;
}) {
  const [loading, setLoading] = React.useState(false);
  const confirmClassName =
    confirmVariant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "bg-destructive text-white hover:bg-destructive/90";
  const noteText = note === undefined ? "This action cannot be undone." : note;

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <div className="flex items-center justify-between p-4 border-b border-muted/10">
        <div className="flex items-center gap-2">
          {icon ?? <Trash2 className="text-destructive" />}
          <div className="text-sm font-semibold">{headerLabel}</div>
        </div>
        <button
          onClick={handleClose}
          className="rounded-md p-1 hover:bg-muted/10"
        >
          <X />
        </button>
      </div>

      <div className="p-4 text-sm text-muted-foreground">
        <div className="font-medium text-foreground">
          {title ?? "Are you sure?"}
        </div>
        {description ? <div className="mt-1">{description}</div> : null}
        {noteText ? (
          <div className="mt-3 text-xs text-muted-foreground">{noteText}</div>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-3 p-4 border-t border-muted/10">
        <button
          onClick={handleClose}
          disabled={loading}
          className="rounded-md px-3 py-1 text-sm hover:bg-muted/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            setLoading(true);
            try {
              await onConfirm();
              handleClose();
            } catch (e) {
              console.error(e);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className={`rounded-md px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${confirmClassName}`}
        >
          {loading ? (
            <div className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : null}
          {confirmLabel}
        </button>
      </div>
    </BaseDialog>
  );
}
