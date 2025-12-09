"use client";

import React, { useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";

export default function ConfirmDeleteModal({
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

  // lock scroll while modal open
  React.useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight || "";
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0)
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose, open]);

  if (!open) return null;

  const modal = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-50 grid place-items-center px-4 py-6 md:py-8"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative z-10 w-[95vw] max-w-md rounded-xl bg-card border border-border shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-muted/10">
            <div className="flex items-center gap-2">
              <Trash2 className="text-destructive" />
              <div className="text-sm font-semibold">Delete item</div>
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
            <div className="mt-3 text-xs text-muted-foreground">
              This action cannot be undone.
            </div>
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
              className="rounded-md px-3 py-1 text-sm bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <div className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : null}
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
