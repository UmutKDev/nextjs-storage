"use client";

import React from "react";
import { createPortal } from "react-dom";
import FileUpload from "./FileUpload";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function FileUploadModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // Lock background scroll when modal is open
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

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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
          onClick={onClose}
        />

        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative z-10 w-[96vw] max-w-5xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden max-h-[calc(100vh-4rem)] flex flex-col"
        >
          <div className="flex items-center justify-between p-5 border-b border-muted/10 shrink-0">
            <div className="space-y-0.5">
              <div className="text-sm text-muted-foreground">Storage</div>
              <div className="text-base font-semibold">Upload files</div>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 hover:bg-muted/10"
            >
              <X />
            </button>
          </div>

          <div className="p-5 overflow-auto flex-1">
            <FileUpload />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
