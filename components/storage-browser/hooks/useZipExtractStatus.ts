import React from "react";
import type {
  CloudObject,
  ZipExtractJob,
} from "@/components/storage-browser/types/storage-browser.types";

const ZIP_EXTENSION = "zip";
const ZIP_ACTIVE_STATES = new Set(["active", "waiting", "delayed"]);
const ZIP_PENDING_STATES = new Set(["waiting", "delayed", "starting"]);

const humanReadableFileSize = (bytes?: number) => {
  if (!bytes || bytes === 0) return "0 B";
  const sizeIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  return (bytes / Math.pow(1024, sizeIndex)).toFixed(1) + " " + sizes[sizeIndex];
};

const isZipFile = (file?: CloudObject) => {
  if (!file) return false;
  const extensionFromField = (file.Extension || "").toLowerCase();
  if (extensionFromField) return extensionFromField === ZIP_EXTENSION;
  const name = file.Metadata?.Originalfilename || file.Name || "";
  const extensionFromName = name.split(".").pop()?.toLowerCase() ?? "";
  return extensionFromName === ZIP_EXTENSION;
};

export const useZipExtractStatus = () => {
  const getReadableExtractStatus = React.useCallback(
    (extractJob: ZipExtractJob) => {
      const state = extractJob.state.toLowerCase();
    if (ZIP_PENDING_STATES.has(state)) {
      return "Cikarma beklemede";
    }
    if (state === "active") {
      const progress = extractJob.progress;
      const entriesProcessed =
        typeof progress?.entriesProcessed === "number"
          ? progress.entriesProcessed
          : null;
      const totalEntries =
        typeof progress?.totalEntries === "number" ? progress.totalEntries : null;
      const bytesRead =
        typeof progress?.bytesRead === "number" ? progress.bytesRead : null;
      const totalBytes =
        typeof progress?.totalBytes === "number" ? progress.totalBytes : null;
      const entryInfo = progress?.currentEntry
        ? ` - ${progress.currentEntry}`
        : "";

      if (bytesRead !== null && totalBytes !== null && totalBytes > 0) {
        return `Cikariliyor ${humanReadableFileSize(
          bytesRead,
        )} / ${humanReadableFileSize(totalBytes)}${entryInfo}`;
      }
      if (entriesProcessed !== null) {
        const entryTotal =
          totalEntries !== null && totalEntries > 0
            ? ` / ${totalEntries}`
            : "";
        return `Cikariliyor ${entriesProcessed}${entryTotal}${entryInfo}`;
      }
      return `Cikariliyor${entryInfo}`;
    }
    if (state === "completed") return "Cikarma tamamlandi";
    if (state === "failed") return extractJob.failedReason || "Cikarma basarisiz";
    if (state === "cancelled") return "Cikarma iptal edildi";
    return "Cikarma durumu bilinmiyor";
  }, []);

  const getZipActionState = React.useCallback(
    ({
      file,
      isLoading,
      hasExtractHandler,
      hasCancelHandler,
      extractJob,
    }: {
      file?: CloudObject;
      isLoading?: boolean;
      hasExtractHandler: boolean;
      hasCancelHandler: boolean;
      extractJob?: ZipExtractJob;
    }) => {
      const canStartExtraction =
        !isLoading && hasExtractHandler && isZipFile(file) && !extractJob;
      const canCancelExtraction =
        !isLoading &&
        hasCancelHandler &&
        (extractJob ? ZIP_ACTIVE_STATES.has(extractJob.state) : false);

      return { canStartExtraction, canCancelExtraction };
    },
    [],
  );

  return { getReadableExtractStatus, getZipActionState };
};
