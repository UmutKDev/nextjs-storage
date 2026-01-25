"use client";

import React, { useCallback } from "react";
import { X, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BaseDialog from "./BaseDialog";

export default function ConfirmMoveDragModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => Promise<void> | void;
}) {
  const [loading, setLoading] = React.useState(false);

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <div className="flex items-center justify-between p-4 border-b border-muted/10">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="text-primary" />
          <div className="text-sm font-semibold">Move Item</div>
        </div>
        <button
          onClick={handleClose}
          className="rounded-md p-1 hover:bg-muted/10"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-4 text-sm text-muted-foreground">
        <div className="font-medium text-foreground">
          {title ?? "Are you sure?"}
        </div>
        {description ? <div className="mt-1">{description}</div> : null}
      </div>

      <div className="flex items-center justify-end gap-3 p-4 border-t border-muted/10">
        <Button
          variant="ghost"
          onClick={handleClose}
          disabled={loading}
          className="h-8"
        >
          Cancel
        </Button>
        <Button
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
          className="h-8"
        >
          {loading ? (
            <div className="mr-2 h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : null}
          Confirm
        </Button>
      </div>
    </BaseDialog>
  );
}
