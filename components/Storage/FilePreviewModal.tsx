"use client";

import React from "react";
import { createPortal } from "react-dom";
import { DownloadCloud, X, Maximize2, Minimize2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LazyPreview from "./LazyPreview";

import type { CloudObjectModel } from "@/Service/Generates/api";

export default function FilePreviewModal({
  file,
  onClose,
  onChange,
  files = [],
}: {
  file: CloudObjectModel | null;
  onClose: () => void;
  onChange?: (file: CloudObjectModel) => void;
  files?: CloudObjectModel[];
}) {
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  const isMedia = React.useCallback((f: CloudObjectModel) => {
    const ext = f.Extension?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext || '');
  }, []);

  const mediaFiles = React.useMemo(() => {
    if (!file || !isMedia(file)) return [];
    return files.filter(isMedia);
  }, [file, files, isMedia]);

  const currentIndex = React.useMemo(() => {
    if (!file || mediaFiles.length === 0) return -1;
    return mediaFiles.findIndex(f => f.Path?.Key === file.Path?.Key);
  }, [file, mediaFiles]);

  const hasNext = currentIndex !== -1 && currentIndex < mediaFiles.length - 1;
  const hasPrev = currentIndex !== -1 && currentIndex > 0;

  const handleNext = React.useCallback(() => {
    if (!hasNext) return;
    onChange?.(mediaFiles[currentIndex + 1]);
  }, [hasNext, currentIndex, mediaFiles, onChange]);

  const handlePrev = React.useCallback(() => {
    if (!hasPrev) return;
    onChange?.(mediaFiles[currentIndex - 1]);
  }, [hasPrev, currentIndex, mediaFiles, onChange]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

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
        className={`fixed inset-0 z-50 grid place-items-center ${
          isFullScreen ? "p-0" : "p-4 sm:p-6"
        }`}
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
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`relative z-10 flex flex-col bg-card border border-border shadow-2xl overflow-hidden transition-all duration-200 ${
            isFullScreen
              ? "w-full h-full rounded-none"
              : "w-full h-[92vh] sm:h-auto sm:max-h-[90vh] sm:min-h-[500px] sm:w-[90vw] md:w-[80vw] lg:max-w-4xl rounded-xl"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-muted/10 shrink-0 gap-4">
            <div className="flex items-center gap-3 min-w-0 overflow-hidden">
              <div 
                className="text-sm font-semibold truncate"
                title={file.Metadata?.Originalfilename ?? file.Name}
              >
                {file.Metadata?.Originalfilename ?? file.Name}
              </div>
              <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full uppercase shrink-0">
                {file.Extension?.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
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
                  className="rounded-2xl px-2 py-1 text-sm hover:bg-muted/55 flex items-center gap-2 bg-muted"
                >
                  <DownloadCloud size={16} />
                  <span className="hidden sm:inline">Download</span>
                </a>
              ) : null}

              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="rounded-md p-1 hover:bg-muted/10"
                title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
              >
                {isFullScreen ? (
                  <Minimize2 size={20} />
                ) : (
                  <Maximize2 size={20} />
                )}
              </button>

              <button
                onClick={onClose}
                className="rounded-md p-1 hover:bg-muted/10"
              >
                <X />
              </button>
            </div>
          </div>

          <div className="relative flex-1 min-h-0 flex flex-col group">
            {hasPrev && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 text-white hover:bg-black/50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Previous"
              >
                <ChevronLeft size={32} />
              </button>
            )}

            {hasNext && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 text-white hover:bg-black/50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Next"
              >
                <ChevronRight size={32} />
              </button>
            )}

            <div className="p-4 overflow-auto flex-1 flex flex-col">
              <LazyPreview file={file} isFullScreen={isFullScreen} />
            </div>
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
