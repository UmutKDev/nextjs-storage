import React from "react";
import type {
  CloudObject,
  ArchiveExtractJob,
  ArchiveCreateJob,
} from "@/components/storage-browser/types/storage-browser.types";
import { isArchiveFile } from "@/features/storage-explorer/utils/archive";

const ARCHIVE_ACTIVE_STATES = new Set(["active", "waiting", "delayed"]);
const ARCHIVE_PENDING_STATES = new Set(["waiting", "delayed", "starting"]);

const humanReadableFileSize = (bytes?: number) => {
  if (!bytes || bytes === 0) return "0 B";
  const sizeIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  return (
    (bytes / Math.pow(1024, sizeIndex)).toFixed(1) + " " + sizes[sizeIndex]
  );
};

export const useArchiveExtractStatus = () => {
  const getReadableExtractStatus = React.useCallback(
    (extractJob: ArchiveExtractJob) => {
      const state = extractJob.state.toLowerCase();
      if (ARCHIVE_PENDING_STATES.has(state)) {
        return "Arsiv cikarma beklemede";
      }
      if (state === "active") {
        const progress = extractJob.progress;
        const phase = progress?.phase;
        const entriesProcessed =
          typeof progress?.entriesProcessed === "number"
            ? progress.entriesProcessed
            : null;
        const totalEntries =
          typeof progress?.totalEntries === "number"
            ? progress.totalEntries
            : null;
        const bytesRead =
          typeof progress?.bytesRead === "number" ? progress.bytesRead : null;
        const totalBytes =
          typeof progress?.totalBytes === "number" ? progress.totalBytes : null;
        const entryInfo = progress?.currentEntry
          ? ` - ${progress.currentEntry}`
          : "";

        const phaseLabel =
          phase === "create" ? "Dosyalar olusturuluyor" : "Arsiv cikariliyor";

        // Prioritize entry-based info (bytes are often 100% immediately)
        if (entriesProcessed !== null) {
          const entryTotal =
            totalEntries !== null && totalEntries > 0
              ? ` / ${totalEntries}`
              : "";
          return `${phaseLabel} ${entriesProcessed}${entryTotal} dosya${entryInfo}`;
        }
        // Fallback to bytes only when still reading the archive
        if (
          bytesRead !== null &&
          totalBytes !== null &&
          totalBytes > 0 &&
          bytesRead < totalBytes
        ) {
          return `${phaseLabel} ${humanReadableFileSize(
            bytesRead,
          )} / ${humanReadableFileSize(totalBytes)}${entryInfo}`;
        }
        return `${phaseLabel}${entryInfo}`;
      }
      if (state === "completed") return "Arsiv cikarma tamamlandi";
      if (state === "failed")
        return extractJob.failedReason || "Arsiv cikarma basarisiz";
      if (state === "cancelled") return "Arsiv cikarma iptal edildi";
      return "Arsiv cikarma durumu bilinmiyor";
    },
    [],
  );

  const getExtractProgress = React.useCallback(
    (extractJob: ArchiveExtractJob): number | null => {
      const state = extractJob.state.toLowerCase();
      if (ARCHIVE_PENDING_STATES.has(state)) return null;
      if (state === "completed") return 100;
      if (state === "failed" || state === "cancelled") return null;

      const progress = extractJob.progress;
      const entriesProcessed =
        typeof progress?.entriesProcessed === "number"
          ? progress.entriesProcessed
          : null;
      const totalEntries =
        typeof progress?.totalEntries === "number"
          ? progress.totalEntries
          : null;

      // Prioritize entry-based progress (bytes are often 100% immediately)
      if (
        entriesProcessed !== null &&
        totalEntries !== null &&
        totalEntries > 0
      ) {
        return Math.min(
          99,
          Math.round((entriesProcessed / totalEntries) * 100),
        );
      }

      // Fallback to bytes only when still reading the archive (not yet 100%)
      const bytesRead =
        typeof progress?.bytesRead === "number" ? progress.bytesRead : null;
      const totalBytes =
        typeof progress?.totalBytes === "number" ? progress.totalBytes : null;
      if (
        bytesRead !== null &&
        totalBytes !== null &&
        totalBytes > 0 &&
        bytesRead < totalBytes
      ) {
        return Math.min(
          99,
          Math.round((bytesRead / totalBytes) * 100),
        );
      }

      // Has progress data but can't compute percentage → indeterminate
      return null;
    },
    [],
  );

  const getReadableCreateStatus = React.useCallback(
    (createJob: ArchiveCreateJob) => {
      const state = createJob.state.toLowerCase();
      if (ARCHIVE_PENDING_STATES.has(state)) {
        return "Arsiv olusturuluyor...";
      }
      if (state === "active") {
        const progress = createJob.progress;
        const bytesProcessed =
          typeof progress?.bytesProcessed === "number"
            ? progress.bytesProcessed
            : null;
        const totalBytes =
          typeof progress?.totalBytes === "number" ? progress.totalBytes : null;
        const entriesProcessed =
          typeof progress?.entriesProcessed === "number"
            ? progress.entriesProcessed
            : null;
        const totalEntries =
          typeof progress?.totalEntries === "number"
            ? progress.totalEntries
            : null;

        if (bytesProcessed !== null && totalBytes !== null && totalBytes > 0) {
          return `Arsiv olusturuluyor ${humanReadableFileSize(bytesProcessed)} / ${humanReadableFileSize(totalBytes)}`;
        }
        if (entriesProcessed !== null) {
          const entryTotal =
            totalEntries !== null && totalEntries > 0
              ? ` / ${totalEntries}`
              : "";
          return `Arsiv olusturuluyor ${entriesProcessed}${entryTotal}`;
        }
        return "Arsiv olusturuluyor...";
      }
      if (state === "completed") return "Arsiv olusturuldu";
      if (state === "failed")
        return createJob.failedReason || "Arsiv olusturma basarisiz";
      if (state === "cancelled") return "Arsiv olusturma iptal edildi";
      return "Arsiv olusturma durumu bilinmiyor";
    },
    [],
  );

  const getCreateProgress = React.useCallback(
    (createJob: ArchiveCreateJob): number | null => {
      const state = createJob.state.toLowerCase();
      if (ARCHIVE_PENDING_STATES.has(state)) return null;
      if (state === "completed") return 100;
      if (state === "failed" || state === "cancelled") return null;

      const progress = createJob.progress;
      const bytesProcessed =
        typeof progress?.bytesProcessed === "number"
          ? progress.bytesProcessed
          : null;
      const totalBytes =
        typeof progress?.totalBytes === "number" ? progress.totalBytes : null;
      if (bytesProcessed !== null && totalBytes !== null && totalBytes > 0) {
        return Math.min(100, Math.round((bytesProcessed / totalBytes) * 100));
      }
      const entriesProcessed =
        typeof progress?.entriesProcessed === "number"
          ? progress.entriesProcessed
          : null;
      const totalEntries =
        typeof progress?.totalEntries === "number"
          ? progress.totalEntries
          : null;
      if (
        entriesProcessed !== null &&
        totalEntries !== null &&
        totalEntries > 0
      ) {
        return Math.min(
          100,
          Math.round((entriesProcessed / totalEntries) * 100),
        );
      }
      return null;
    },
    [],
  );

  const getArchiveActionState = React.useCallback(
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
      extractJob?: ArchiveExtractJob;
    }) => {
      const canStartExtraction =
        !isLoading && hasExtractHandler && isArchiveFile(file) && !extractJob;
      const canCancelExtraction =
        !isLoading &&
        hasCancelHandler &&
        (extractJob ? ARCHIVE_ACTIVE_STATES.has(extractJob.state) : false);

      return { canStartExtraction, canCancelExtraction };
    },
    [],
  );

  return {
    getReadableExtractStatus,
    getExtractProgress,
    getReadableCreateStatus,
    getCreateProgress,
    getArchiveActionState,
  };
};
