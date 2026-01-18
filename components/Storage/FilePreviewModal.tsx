"use client";

import React from "react";
import { createPortal } from "react-dom";
import {
  DownloadCloud,
  X,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LazyPreview from "./LazyPreview";
import ShareFileModal from "./ShareFileModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

import type { CloudObjectModel } from "@/Service/Generates/api";
import {
  getCloudObjectUrl,
  getImageCdnUrl,
  getScaledImageDimensions,
  isImageFile,
} from "./imageCdn";

function humanFileSize(bytes?: number) {
  if (!bytes || bytes === 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
}

function formatOriginalSize(file: CloudObjectModel) {
  const size = humanFileSize(file?.Size);
  const rawWidth = file?.Metadata?.Width;
  const rawHeight = file?.Metadata?.Height;
  const width = rawWidth ? Number(rawWidth) : null;
  const height = rawHeight ? Number(rawHeight) : null;
  const hasDims =
    width && height && Number.isFinite(width) && Number.isFinite(height);
  const dims = hasDims
    ? `${Math.round(width)}x${Math.round(height)}`
    : null;
  return `Orijinal boyut: ${size}${dims ? ` • ${dims}` : ""}`;
}

function formatScaledSize(
  file: CloudObjectModel,
  options?: { isFullScreen?: boolean }
) {
  if (!isImageFile(file)) return "Ölçekli boyut: —";
  const scaled = getScaledImageDimensions(file, {
    target: options?.isFullScreen ? "fullscreen" : "preview",
  });
  if (!scaled) return "Ölçekli boyut: —";
  return `Ölçekli boyut: ${scaled.width}x${scaled.height}`;
}

export default function FilePreviewModal({
  file,
  onClose,
  onChange,
  files = [],
  onDelete,
}: {
  file: CloudObjectModel | null;
  onClose: () => void;
  onChange?: (file: CloudObjectModel) => void;
  files?: CloudObjectModel[];
  onDelete?: (file: CloudObjectModel) => void;
}) {
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const downloadUrl = getCloudObjectUrl(file ?? undefined);
  const scaledDownloadUrl = file
    ? getImageCdnUrl(file, {
        target: isFullScreen ? "fullscreen" : "preview",
      })
    : undefined;
  const hasScaledDownload =
    Boolean(downloadUrl) &&
    Boolean(scaledDownloadUrl) &&
    isImageFile(file ?? undefined) &&
    scaledDownloadUrl !== downloadUrl;

  const isMedia = React.useCallback((f: CloudObjectModel) => {
    const ext = f.Extension?.toLowerCase();
    return [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "mp4",
      "webm",
      "mov",
      "avi",
      "mkv",
    ].includes(ext || "");
  }, []);

  const mediaFiles = React.useMemo(() => {
    if (!file || !isMedia(file)) return [];
    return files.filter(isMedia);
  }, [file, files, isMedia]);

  const currentIndex = React.useMemo(() => {
    if (!file || mediaFiles.length === 0) return -1;
    return mediaFiles.findIndex((f) => f.Path?.Key === file.Path?.Key);
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
        key="file-preview-modal"
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
              : "w-full sm:h-auto sm:max-h-[90vh] sm:min-h-[500px] sm:w-[90vw] md:w-[80vw] lg:max-w-4xl rounded-xl"
          }`}
        >
          <div className="flex items-center justify-between p-3 border-b border-border/40 shrink-0 gap-4 bg-muted/5">
            <div className="flex items-center gap-3 min-w-0 overflow-hidden">
              <div className="flex flex-col min-w-0">
                <div
                  className="text-sm font-semibold truncate text-foreground"
                  title={file.Metadata?.Originalfilename ?? file.Name}
                >
                  {file.Metadata?.Originalfilename ?? file.Name}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="uppercase font-medium tracking-wide text-[10px] bg-muted px-1.5 rounded-sm">
                    {file.Extension}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {downloadUrl ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title="İndir"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DownloadCloud size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <a
                        href={downloadUrl}
                        download={file.Name}
                        target="_blank"
                        rel="noreferrer noopener"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Orijinal
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild disabled={!hasScaledDownload}>
                      <a
                        href={scaledDownloadUrl ?? downloadUrl}
                        download={file.Name}
                        target="_blank"
                        rel="noreferrer noopener"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ölçekli
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}

              <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setShowShareModal(true)}
                title="Paylaş"
              >
                <Share2 size={18} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete?.(file)}
                title="Sil"
              >
                <Trash2 size={18} />
              </Button>

              <div className="h-6 w-px bg-border/60 mx-1" />

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsFullScreen(!isFullScreen)}
                title={isFullScreen ? "Küçült" : "Tam Ekran"}
              >
                {isFullScreen ? (
                  <Minimize2 size={18} />
                ) : (
                  <Maximize2 size={18} />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={onClose}
              >
                <X size={18} />
              </Button>
            </div>
          </div>

          <div className="relative flex-1 min-h-0 flex flex-col group">
            {hasPrev && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 text-white hover:bg-black/50 transition-colors"
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
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 text-white hover:bg-black/50 transition-colors"
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
            <div>{formatOriginalSize(file)}</div>
            <div>{formatScaledSize(file, { isFullScreen })}</div>
            <div>
              Değiştirilme:{" "}
              {file.LastModified
                ? new Date(file.LastModified).toLocaleString()
                : "—"}
            </div>
          </div>
        </motion.div>
      </motion.div>
      <ShareFileModal
        key="share-file-modal"
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        file={file}
      />
    </AnimatePresence>
  );

  // Render modal as a portal to document.body to avoid stacking/parent layout issues
  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
