"use client";

import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LazyPreview from "./LazyPreview";

import type { CloudObjectModel } from "@/Service/Generates/api";

type CloudObject = CloudObjectModel;

export default function FilePreviewModal({
  file,
  onClose,
}: {
  file: CloudObjectModel | null;
  onClose: () => void;
}) {
  const url = file?.Path?.Url ?? file?.Path?.Key ?? undefined;

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

  const mime = (file.MimeType ?? "").toLowerCase();

  const renderPreview = () => {
    if (!url)
      return (
        <div className="p-8 text-sm text-muted-foreground">
          No URL available for preview.
        </div>
      );

    if (
      mime.startsWith("image") ||
      ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
        (file.Extension || "").toLowerCase()
      )
    ) {
      return (
        <div className="flex items-center justify-center p-6">
          <img
            src={url}
            alt={file.Name}
            className="max-h-[60vh] max-w-full rounded-md object-contain"
          />
        </div>
      );
    }

    if (mime.startsWith("video")) {
      return (
        <div className="p-6">
          <video controls className="w-full max-h-[70vh] rounded-md bg-black">
            <source src={url} type={file.MimeType} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (mime.startsWith("audio")) {
      return (
        <div className="p-6">
          <audio controls className="w-full">
            <source src={url} type={file.MimeType} />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }

    if (
      mime.includes("pdf") ||
      (file.Extension || "").toLowerCase() === "pdf"
    ) {
      return (
        <div className="p-6">
          <iframe
            src={url}
            title={file.Name}
            className="w-full min-h-[70vh] rounded-md"
          />
        </div>
      );
    }

    if (
      mime.startsWith("text") ||
      mime.includes("json") ||
      mime.includes("xml")
    ) {
      if (loading)
        return (
          <div className="p-6 text-sm text-muted-foreground">
            Loading preview…
          </div>
        );
      return (
        <div className="p-4 max-h-[60vh] overflow-auto bg-muted/5 rounded-md border border-muted/20">
          <pre className="whitespace-pre-wrap text-xs leading-relaxed">
            {textContent ?? "No preview available"}
          </pre>
        </div>
      );
    }

    // Fallback
    return (
      <div className="p-6 text-sm text-muted-foreground">
        No preview available for this file type.
      </div>
    );
  };

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
            <button
              onClick={onClose}
              className="rounded-md p-1 hover:bg-muted/10"
            >
              <X />
            </button>
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
