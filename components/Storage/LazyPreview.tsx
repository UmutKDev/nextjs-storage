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
import { getCloudObjectUrl, getImageCdnUrl, isImageFile } from "./imageCdn";
import { downloadWithRetry } from "@/lib/download";
import { retryWithBackoff } from "@/lib/retry";

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

  const baseUrl = getCloudObjectUrl(file);
  const mime = (file?.MimeType ?? "").toLowerCase();
  const ext = (file.Extension || "").toLowerCase();

  // File Type Detection
  const isImage = isImageFile(file);
  const imageUrl = isImage
    ? getImageCdnUrl(file, {
        target: isFullScreen ? "fullscreen" : "preview",
      })
    : baseUrl;
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

  class RetryableResponseError extends Error {
    response: Response;

    constructor(response: Response) {
      super(`Retryable response: ${response.status}`);
      this.response = response;
    }
  }

  const fetchTextWithRetry = React.useCallback(async (url: string) => {
    const response = await retryWithBackoff(
      async () => {
        const res = await fetch(url);
        if (res.status === 429) {
          throw new RetryableResponseError(res);
        }
        if (!res.ok) {
          throw new Error(`Failed to load content (${res.status})`);
        }
        return res;
      },
      {
        shouldRetry: (err) =>
          err instanceof RetryableResponseError &&
          err.response.status === 429,
      }
    );
    return response.text();
  }, []);

  React.useEffect(() => {
    setText(null);
    setError(null);
    if (!inView || !baseUrl) return;

    if (isText && !isOffice && !isPdf) {
      setLoading(true);
      fetchTextWithRetry(baseUrl)
        .then((t) => setText(t))
        .catch(() => setError("Unable to load text preview"))
        .finally(() => setLoading(false));
    }
  }, [inView, baseUrl, mime, isText, isOffice, isPdf, fetchTextWithRetry]);

  // Image State
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
  }, [imageUrl]);

  const handleDownload = React.useCallback(async () => {
    if (!baseUrl) return;
    const filename = file?.Metadata?.Originalfilename || file.Name || "download";
    try {
      await downloadWithRetry({ url: baseUrl, filename });
    } catch {
      setError("Download failed");
    }
  }, [baseUrl, file]);

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
          className={`relative flex items-center justify-center w-full min-h-0 sm:bg-muted/5 sm:rounded-lg sm:overflow-hidden ${
            isFullScreen
              ? "h-full"
              : "h-full min-h-[60vh] sm:min-h-0 sm:h-auto sm:max-h-[70vh]"
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
            src={imageUrl}
            alt={file.Name}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{
              opacity: imgLoaded ? 1 : 0,
              scale: imgLoaded ? 1 : 0.98,
            }}
            transition={{ duration: 0.3 }}
            className={`h-full w-full max-h-full max-w-full object-contain sm:h-auto sm:w-auto sm:shadow-sm ${
              isFullScreen ? "sm:max-h-[90vh]" : "sm:max-h-[70vh]"
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
        <div className="bg-black h-full flex items-center justify-center sm:rounded-lg sm:overflow-hidden sm:shadow-md">
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
            <source src={baseUrl} type={file.MimeType} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (isUnsupportedVideo) {
      return (
        <div className="flex flex-col items-center justify-center p-6 sm:p-12 sm:bg-muted/5 sm:rounded-lg sm:border sm:border-dashed sm:border-border h-full">
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
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download Video
          </Button>
        </div>
      );
    }

    if (isAudio) {
      return (
        <div className="p-4 sm:p-8 flex items-center justify-center sm:bg-muted/10 sm:rounded-lg sm:border sm:border-border/50">
          <audio controls className="w-full max-w-md">
            <source src={baseUrl} type={file.MimeType} />
          </audio>
        </div>
      );
    }

    if (isPdf) {
      return (
        <div
          className={`w-full overflow-hidden relative sm:bg-muted/10 sm:rounded-lg sm:border sm:border-border/50 ${
            isFullScreen ? "h-[calc(100vh-8rem)]" : "h-full sm:h-[70vh]"
          }`}
        >
          <iframe
            src={baseUrl}
            className="w-full h-full"
            title={file.Name}
          />
        </div>
      );
    }

    if (isOffice || isGoogleDoc) {
      return (
        <div className="flex flex-col items-center justify-center p-6 sm:p-12 sm:bg-muted/5 sm:rounded-lg sm:border sm:border-dashed sm:border-border h-full">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium mb-1">Preview not available</h3>
          <p className="text-xs text-muted-foreground mb-4 text-center max-w-[200px]">
            Office previews need public access. Download to view this file.
          </p>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download File
          </Button>
        </div>
      );
    }

    if (isText) {
      return (
        <div className="relative overflow-hidden h-full sm:rounded-lg sm:border sm:border-border/50 sm:bg-muted/5">
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
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 sm:bg-muted/5 sm:rounded-lg sm:border sm:border-dashed sm:border-border h-full">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium mb-1">Preview not available</h3>
        <p className="text-xs text-muted-foreground mb-4 text-center max-w-[200px]">
          This file type cannot be previewed directly in the browser.
        </p>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download File
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
