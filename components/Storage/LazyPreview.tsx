"use client";

import React from "react";
import {
  Loader2,
  FileText,
  AlertCircle,
  Download,
  VideoOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CloudObjectModel } from "@/Service/Generates/api";
import { Button } from "@/components/ui/button";

function useInView<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
            break;
          }
        }
      },
      { root: null, rootMargin: "200px", threshold: 0.01 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, inView } as const;
}

export default function LazyPreview({
  file,
  isFullScreen = false,
}: {
  file: CloudObjectModel;
  isFullScreen?: boolean;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [loading, setLoading] = React.useState(false);
  const [text, setText] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const url = file?.Path?.Url ?? file?.Path?.Key ?? undefined;
  const mime = (file?.MimeType ?? "").toLowerCase();
  const ext = (file.Extension || "").toLowerCase();

  // File Type Detection
  const isImage =
    mime.startsWith("image") ||
    ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext);
  const isVideo =
    (mime.startsWith("video") && ["mp4", "webm", "ogg"].includes(ext)) ||
    ["mp4", "webm", "ogg"].includes(ext);
  const isUnsupportedVideo =
    (mime.startsWith("video") ||
      ["mov", "avi", "wmv", "flv", "mkv", "3gp"].includes(ext)) &&
    !isVideo;
  const isAudio =
    mime.startsWith("audio") || ["mp3", "wav", "ogg"].includes(ext);
  const isPdf = mime.includes("pdf") || ext === "pdf";

  // Office Documents
  const isWord = ["doc", "docx", "rtf"].includes(ext);
  const isExcel = ["xls", "xlsx", "csv"].includes(ext);
  const isPowerPoint = ["ppt", "pptx"].includes(ext);
  const isOffice = isWord || isExcel || isPowerPoint;

  // Google Docs / Other Embeddable
  const isGoogleDoc = ["gdoc", "gsheet", "gslides"].includes(ext);

  const isText =
    mime.startsWith("text") ||
    [
      "json",
      "xml",
      "js",
      "ts",
      "tsx",
      "jsx",
      "html",
      "css",
      "scss",
      "md",
      "txt",
      "yml",
      "yaml",
      "sql",
      "py",
      "java",
      "c",
      "cpp",
      "h",
      "cs",
      "php",
      "rb",
      "go",
      "rs",
      "sh",
      "bat",
      "env",
    ].includes(ext);

  React.useEffect(() => {
    setText(null);
    setError(null);
    if (!inView || !url) return;

    if (isText && !isOffice && !isPdf) {
      setLoading(true);
      fetch(url)
        .then((r) => {
          if (!r.ok) throw new Error("Failed to load content");
          return r.text();
        })
        .then((t) => setText(t))
        .catch(() => setError("Unable to load text preview"))
        .finally(() => setLoading(false));
    }
  }, [inView, url, mime, isText, isOffice, isPdf]);

  // Image State
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
  }, [url]);

  // Embed URL Logic
  const getEmbedUrl = () => {
    if (!url) return "";
    const encodedUrl = encodeURIComponent(url);

    if (isOffice) {
      // Microsoft Office Online Viewer
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
    }

    // Google Docs Viewer (Fallback for PDF if needed, or other types)
    return `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`;
  };

  const renderContent = () => {
    if (!inView) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          <span className="text-sm font-medium">Preparing preview...</span>
        </div>
      );
    }

    if (isImage) {
      const width = file?.Metadata?.Width
        ? parseInt(file.Metadata.Width)
        : undefined;
      const height = file?.Metadata?.Height
        ? parseInt(file.Metadata.Height)
        : undefined;
      const aspectRatio = width && height ? width / height : undefined;

      return (
        <div
          className={`relative flex items-center justify-center bg-muted/5 rounded-lg overflow-hidden w-full ${
            isFullScreen ? "h-full" : "h-auto"
          }`}
          style={{
            aspectRatio:
              !isFullScreen && aspectRatio ? `${aspectRatio}` : undefined,
            minHeight: isFullScreen
              ? "80vh"
              : aspectRatio
              ? undefined
              : "300px",
          }}
        >
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
            </div>
          )}
          <motion.img
            src={url}
            alt={file.Name}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{
              opacity: imgLoaded ? 1 : 0,
              scale: imgLoaded ? 1 : 0.98,
            }}
            transition={{ duration: 0.3 }}
            className={`w-auto max-w-full object-contain shadow-sm ${
              isFullScreen ? "max-h-[90vh]" : "max-h-[70vh]"
            }`}
            style={{
              aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
            }}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            loading="lazy"
          />

          {imgError && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground p-8">
              <AlertCircle className="h-8 w-8" />
              <span className="text-sm">Failed to load image</span>
            </div>
          )}
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="rounded-lg overflow-hidden bg-black shadow-md h-full flex items-center justify-center">
          <video
            autoPlay
            controls
            loop
            muted
            className={`w-full ${
              isFullScreen ? "max-h-[90vh]" : "max-h-[70vh]"
            }`}
            preload="metadata"
          >
            <source src={url} type={file.MimeType} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (isUnsupportedVideo) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-muted/5 rounded-lg border border-dashed border-border h-full">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <VideoOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium mb-1">
            Video format not supported
          </h3>
          <p className="text-xs text-muted-foreground mb-4 text-center max-w-[200px]">
            This video format cannot be played in the browser. Please download
            to view.
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Download Video
            </a>
          </Button>
        </div>
      );
    }

    if (isAudio) {
      return (
        <div className="p-8 flex items-center justify-center bg-muted/10 rounded-lg border border-border/50">
          <audio controls className="w-full max-w-md">
            <source src={url} type={file.MimeType} />
          </audio>
        </div>
      );
    }

    if (isPdf) {
      return (
        <div
          className={`w-full bg-muted/10 rounded-lg border border-border/50 overflow-hidden relative ${
            isFullScreen ? "h-[calc(100vh-8rem)]" : "h-[70vh]"
          }`}
        >
          <iframe src={url} className="w-full h-full" title={file.Name} />
        </div>
      );
    }

    if (isOffice || isGoogleDoc) {
      return (
        <div
          className={`w-full bg-muted/10 rounded-lg border border-border/50 overflow-hidden relative group ${
            isFullScreen ? "h-[calc(100vh-8rem)]" : "h-[70vh]"
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-center -z-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/30" />
          </div>
          <iframe
            src={getEmbedUrl()}
            className="w-full h-full"
            title="Document Preview"
            frameBorder="0"
          />
        </div>
      );
    }

    if (isText) {
      return (
        <div className="relative rounded-lg border border-border/50 bg-muted/5 overflow-hidden h-full">
          <div
            className={`${
              isFullScreen ? "h-[calc(100vh-8rem)]" : "max-h-[60vh]"
            } overflow-auto p-4 custom-scrollbar`}
          >
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-sm">Loading content...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <AlertCircle className="h-8 w-8 text-destructive/50" />
                <span className="text-sm">{error}</span>
              </div>
            ) : (
              <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap wrap-break-word text-foreground/80">
                {text || "No content available"}
              </pre>
            )}
          </div>
        </div>
      );
    }

    // Fallback for unknown types
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-muted/5 rounded-lg border border-dashed border-border h-full">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium mb-1">Preview not available</h3>
        <p className="text-xs text-muted-foreground mb-4 text-center max-w-[200px]">
          This file type cannot be previewed directly in the browser.
        </p>
        <Button variant="outline" size="sm" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4 mr-2" />
            Download File
          </a>
        </Button>
      </div>
    );
  };

  return (
    <div ref={ref} className="w-full space-y-3 h-full">
      {/* Header with actions */}

      <AnimatePresence mode="wait">
        <motion.div
          key={file.Path?.Key || file.Name || "preview"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
