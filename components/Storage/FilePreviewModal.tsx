"use client";

import React from "react";
import { createPortal } from "react-dom";
import { DownloadCloud, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LazyPreview from "./LazyPreview";

import type { CloudObjectModel } from "@/Service/Generates/api";

export default function FilePreviewModal({
  file,
  onClose,
}: {
  file: CloudObjectModel | null;
  onClose: () => void;
}) {
  // Lock background scroll while modal is open
  React.useEffect(() => {
    // running only in the browser when modal is mounted
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight || "";

    // account for scrollbar width to avoid layout shift
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, []);

  if (!file) return null;

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
          className="relative z-10 w-[95vw] max-w-4xl rounded-xl bg-card border border-border shadow-2xl overflow-hidden max-h-[calc(100vh-6rem)] flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-muted/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold">{file.Name}</div>
              <div className="text-xs text-muted-foreground">
                {file.Extension?.toUpperCase()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {file.Path?.Url || file.Path?.Host ? (
                <a
                  href={
                    file.Path?.Url ??
                    `${String(file.Path?.Host).replace(/\/$/, "")}/${
                      file.Path?.Key
                    }`
                  }
                  download={file.Name}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={(e) => e.stopPropagation()}
                  className="rounded px-2 py-1 text-sm hover:bg-muted/10 flex items-center gap-2"
                >
                  <DownloadCloud size={16} />
                  <span className="hidden sm:inline">Download</span>
                </a>
              ) : null}

              <button
                onClick={onClose}
                className="rounded-md p-1 hover:bg-muted/10"
              >
                <X />
              </button>
            </div>
          </div>

          <div className="p-4 overflow-auto flex-1">
            <LazyPreview file={file} />
          </div>

          <div className="flex items-center justify-end gap-3 p-4 border-t border-muted/10 text-xs text-muted-foreground shrink-0">
            <div>
              Size: {file.Size ? `${(file.Size / 1024).toFixed(1)} KB` : "—"}
            </div>
            <div>
              Modified:{" "}
              {file.LastModified
                ? new Date(file.LastModified).toLocaleString()
                : "—"}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // Render modal as a portal to document.body to avoid stacking/parent layout issues
  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
