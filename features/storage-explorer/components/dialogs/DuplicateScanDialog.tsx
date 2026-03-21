"use client";

import React from "react";
import {
  SearchCheck,
  X,
  AlertCircle,
  Ban,
  CheckCircle2,
  Trash2,
  FileIcon,
  ImageIcon,
} from "lucide-react";
import BaseDialog from "@/components/Storage/BaseDialog";
import { cloudApiFactory } from "@/Service/Factories";
import { createIdempotencyKey } from "@/lib/idempotency";
import { useExplorerActions } from "../../contexts/ExplorerActionsContext";
import { useExplorerQuery } from "../../contexts/ExplorerQueryContext";
import useUserStorageUsage from "@/hooks/useUserStorageUsage";

type DuplicateScanDialogProps = {
  open: boolean;
  payload: { path: string } | null;
  onClose: () => void;
};

type DeletePhase = "idle" | "confirm" | "deleting" | "success" | "error";

const PHASE_LABELS: Record<string, string> = {
  LISTING: "Listing files",
  SIZE_GROUPING: "Grouping by size",
  CONTENT_HASHING: "Hashing file contents",
  PERCEPTUAL_HASHING: "Analyzing images",
  FINALIZING: "Finalizing results",
};

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${["B", "KB", "MB", "GB", "TB"][i]}`;
}

type DuplicateFile = {
  key?: string;
  name?: string;
  size?: number;
  lastModified?: string;
  mimeType?: string;
  path?: {
    host?: string;
    key?: string;
    url?: string;
  };
};

type DuplicateGroup = {
  groupId?: string;
  matchType?: string;
  similarity?: number;
  files?: DuplicateFile[];
  potentialSavingsBytes?: number;
};

function buildDefaultSelection(
  groups: DuplicateGroup[] | undefined,
): Set<string> {
  const keys = new Set<string>();
  if (!groups) return keys;
  for (const group of groups) {
    if (!group.files) continue;
    // Skip first file (keep as original), select the rest
    for (let i = 1; i < group.files.length; i++) {
      const key = group.files[i].key;
      if (key) keys.add(key);
    }
  }
  return keys;
}

export default function DuplicateScanDialog({
  open,
  payload,
  onClose,
}: DuplicateScanDialogProps) {
  const {
    duplicateScanJob,
    startDuplicateScan,
    cancelDuplicateScan,
    clearDuplicateScanJob,
  } = useExplorerActions();
  const { invalidateDirectories, invalidateObjects } = useExplorerQuery();
  const { invalidate: invalidateUsage } = useUserStorageUsage();

  const [recursive, setRecursive] = React.useState(true);
  const [threshold, setThreshold] = React.useState(95);
  const [starting, setStarting] = React.useState(false);

  // Delete state
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(
    new Set(),
  );
  const [deletePhase, setDeletePhase] = React.useState<DeletePhase>("idle");
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [deletedCount, setDeletedCount] = React.useState(0);
  const [deletedBytes, setDeletedBytes] = React.useState(0);

  const path = payload?.path ?? "/";
  const job = duplicateScanJob;

  React.useEffect(() => {
    if (open) {
      setRecursive(true);
      setThreshold(95);
      setStarting(false);
      setDeletePhase("idle");
      setDeleteError(null);
      setDeletedCount(0);
      setDeletedBytes(0);
    }
  }, [open]);

  // Initialize selection when results arrive
  React.useEffect(() => {
    if (job?.state === "completed" && job.result?.groups) {
      setSelectedKeys(buildDefaultSelection(job.result.groups));
      setDeletePhase("idle");
    }
  }, [job?.state, job?.result?.groups]);

  const handleStart = React.useCallback(async () => {
    setStarting(true);
    try {
      await startDuplicateScan(path, recursive, threshold);
    } catch (e) {
      console.error(e);
    } finally {
      setStarting(false);
    }
  }, [path, recursive, threshold, startDuplicateScan]);

  const handleClose = React.useCallback(() => {
    if (
      !job ||
      job.state === "completed" ||
      job.state === "failed" ||
      job.state === "cancelled"
    ) {
      clearDuplicateScanJob();
    }
    onClose();
  }, [job, clearDuplicateScanJob, onClose]);

  // Selection helpers
  const toggleFile = React.useCallback((key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const toggleGroup = React.useCallback(
    (group: DuplicateGroup) => {
      const groupKeys = (group.files ?? [])
        .map((f) => f.key)
        .filter((k): k is string => Boolean(k));
      const allSelected = groupKeys.every((k) => selectedKeys.has(k));
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        if (allSelected) {
          for (const k of groupKeys) next.delete(k);
        } else {
          for (const k of groupKeys) next.add(k);
        }
        return next;
      });
    },
    [selectedKeys],
  );

  const selectAllDuplicates = React.useCallback(() => {
    if (job?.result?.groups) {
      setSelectedKeys(buildDefaultSelection(job.result.groups));
    }
  }, [job?.result?.groups]);

  // Compute selected size
  const totalSelectedSize = React.useMemo(() => {
    if (!job?.result?.groups) return 0;
    let total = 0;
    for (const group of job.result.groups) {
      for (const file of group.files ?? []) {
        if (file.key && selectedKeys.has(file.key)) {
          total += file.size ?? 0;
        }
      }
    }
    return total;
  }, [job?.result?.groups, selectedKeys]);

  // Delete flow
  const handleDeleteRequest = React.useCallback(() => {
    setDeletePhase("confirm");
  }, []);

  const cancelDelete = React.useCallback(() => {
    setDeletePhase("idle");
    setDeleteError(null);
  }, []);

  const confirmDelete = React.useCallback(async () => {
    const keysToDelete = Array.from(selectedKeys);
    if (keysToDelete.length === 0) return;

    setDeletePhase("deleting");
    setDeleteError(null);

    try {
      await cloudApiFactory._delete({
        idempotencyKey: createIdempotencyKey(),
        cloudDeleteRequestModel: {
          Items: keysToDelete.map((key) => ({
            Key: key,
            IsDirectory: false,
          })),
        },
      });

      setDeletedCount(keysToDelete.length);
      setDeletedBytes(totalSelectedSize);
      setDeletePhase("success");

      await Promise.all([
        invalidateObjects(),
        invalidateDirectories(),
        invalidateUsage(),
      ]);
    } catch (error) {
      console.error("Failed to delete duplicates:", error);
      setDeleteError(
        error instanceof Error
          ? error.message
          : "An error occurred while deleting files.",
      );
      setDeletePhase("error");
    }
  }, [
    selectedKeys,
    totalSelectedSize,
    invalidateObjects,
    invalidateDirectories,
    invalidateUsage,
  ]);

  const isActive =
    job?.state === "starting" ||
    job?.state === "pending" ||
    job?.state === "scanning";
  const showConfig = !job || (!isActive && job.state !== "completed");
  const showProgress = isActive;
  const showResults = job?.state === "completed";
  const showFailed = job?.state === "failed";
  const showCancelled = job?.state === "cancelled";
  const hasGroups = Boolean(showResults && job.result?.totalDuplicateGroups);

  const panelClassName =
    hasGroups && deletePhase === "idle"
      ? "relative z-10 w-[95vw] max-w-4xl rounded-xl bg-card border border-border shadow-2xl overflow-hidden"
      : undefined;

  return (
    <BaseDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
      }}
      closeOnOverlayClick={!isActive && deletePhase !== "deleting"}
      panelClassName={panelClassName}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-muted/10">
        <div className="flex items-center gap-2">
          <SearchCheck className="text-primary h-5 w-5" />
          <div className="text-sm font-semibold">
            {showConfig && "Scan for Duplicates"}
            {showProgress && "Scanning for Duplicates..."}
            {showResults &&
              (hasGroups
                ? deletePhase === "success"
                  ? "Deletion Complete"
                  : "Duplicate Scan Results"
                : "No Duplicates Found")}
            {showFailed && "Scan Failed"}
            {showCancelled && "Scan Cancelled"}
          </div>
        </div>
        {!isActive && deletePhase !== "deleting" && (
          <button
            onClick={handleClose}
            className="rounded-md p-1 hover:bg-muted/10"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Configuration */}
      {showConfig && (
        <>
          <div className="p-4 text-sm space-y-4">
            <div className="text-muted-foreground">
              Scan{" "}
              <span className="font-medium text-foreground">{path || "/"}</span>{" "}
              for duplicate files using content and perceptual image hashing.
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={recursive}
                onChange={(e) => setRecursive(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm">Include subfolders</span>
            </label>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">
                  Similarity threshold
                </label>
                <span className="text-xs text-muted-foreground">
                  {threshold}%
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <p className="text-xs text-muted-foreground">
                Files with similarity at or above this threshold will be
                considered duplicates.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-4 border-t border-muted/10">
            <button
              onClick={handleClose}
              disabled={starting}
              className="rounded-md px-3 py-1 text-sm hover:bg-muted/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleStart}
              disabled={starting}
              className="rounded-md px-3 py-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {starting && (
                <div className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              )}
              Start Scan
            </button>
          </div>
        </>
      )}

      {/* Progress */}
      {showProgress && (
        <>
          <div className="p-4 text-sm space-y-4">
            <div className="space-y-2">
              {job.progress?.phase && (
                <div className="text-xs font-medium text-muted-foreground">
                  {PHASE_LABELS[job.progress.phase] ?? job.progress.phase}
                </div>
              )}
              <div className="w-full bg-muted/20 rounded-full h-2 overflow-hidden">
                {job.progress?.percentage != null ? (
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(job.progress.percentage, 100)}%`,
                    }}
                  />
                ) : (
                  <div className="bg-primary h-full rounded-full w-1/3 animate-pulse" />
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {job.progress?.processedFiles != null &&
                  job.progress?.totalFiles != null
                    ? `${job.progress.processedFiles} / ${job.progress.totalFiles} files`
                    : job.progress?.processedFiles != null
                      ? `${job.progress.processedFiles} files processed`
                      : "Preparing..."}
                </span>
                {job.progress?.percentage != null && (
                  <span>{Math.round(job.progress.percentage)}%</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-4 border-t border-muted/10">
            <button
              onClick={() => void cancelDuplicateScan()}
              className="rounded-md px-3 py-1 text-sm text-destructive hover:bg-destructive/10"
            >
              Cancel Scan
            </button>
          </div>
        </>
      )}

      {/* Results — duplicates found — selection/idle */}
      {hasGroups && deletePhase === "idle" ? (
        <>
          <div className="p-4 text-sm space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/10 p-3 text-center">
                <div className="text-lg font-semibold">
                  {job?.result?.totalFilesScanned ?? 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  Files Scanned
                </div>
              </div>
              <div className="rounded-lg bg-muted/10 p-3 text-center">
                <div className="text-lg font-semibold">
                  {job?.result?.totalDuplicateGroups}
                </div>
                <div className="text-xs text-muted-foreground">
                  Duplicate Groups
                </div>
              </div>
              <div className="rounded-lg bg-muted/10 p-3 text-center">
                <div className="text-lg font-semibold">
                  {formatBytes(job?.result?.totalPotentialSavingsBytes)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Potential Savings
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {selectedKeys.size} file{selectedKeys.size !== 1 ? "s" : ""}{" "}
                selected ({formatBytes(totalSelectedSize)})
              </span>
              <button
                type="button"
                onClick={selectAllDuplicates}
                className="text-xs text-primary hover:underline"
              >
                Select all duplicates
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-1">
              {job?.result?.groups?.map((group, i) => {
                const groupKeys = (group.files ?? [])
                  .map((f) => f.key)
                  .filter((k): k is string => Boolean(k));
                const allGroupSelected = groupKeys.every((k) =>
                  selectedKeys.has(k),
                );
                const someGroupSelected = groupKeys.some((k) =>
                  selectedKeys.has(k),
                );

                return (
                  <div
                    key={group.groupId ?? i}
                    className="rounded-lg border border-border p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={allGroupSelected}
                        ref={(el) => {
                          if (el)
                            el.indeterminate =
                              someGroupSelected && !allGroupSelected;
                        }}
                        onChange={() => toggleGroup(group)}
                        className="rounded border-border shrink-0"
                      />
                      <span
                        className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                          group.matchType === "exact"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {group.matchType === "exact" ? "Exact" : "Similar"}
                      </span>
                      {group.similarity != null && (
                        <span className="text-xs text-muted-foreground">
                          {Math.round(group.similarity)}% match
                        </span>
                      )}
                      {group.potentialSavingsBytes != null && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatBytes(group.potentialSavingsBytes)} saveable
                        </span>
                      )}
                    </div>

                    {/* File previews grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {group.files?.map((file, j) => {
                        const isOriginal = j === 0;
                        const fileKey = file.key;
                        const isSelected = fileKey
                          ? selectedKeys.has(fileKey)
                          : false;
                        const isImage = file.mimeType?.startsWith("image/");
                        const previewUrl =
                          isImage && file.path?.url
                            ? `${file.path.url}&w=450&h=450`
                            : undefined;

                        return (
                          <div
                            key={fileKey ?? j}
                            className={`relative rounded-lg border p-2 text-xs cursor-pointer transition-colors ${
                              isSelected
                                ? "border-destructive/50 bg-destructive/5"
                                : "border-border hover:border-muted-foreground/30"
                            }`}
                            onClick={() => fileKey && toggleFile(fileKey)}
                          >
                            {/* Thumbnail / icon */}
                            <div className="aspect-square rounded-md bg-muted/10 mb-2 flex items-center justify-center overflow-hidden">
                              {isImage && previewUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={previewUrl}
                                  alt={file.name ?? file.key}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : isImage ? (
                                <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                              ) : (
                                <FileIcon className="h-8 w-8 text-muted-foreground/40" />
                              )}
                            </div>

                            {/* Checkbox + name */}
                            <div className="flex items-start gap-1.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => fileKey && toggleFile(fileKey)}
                                onClick={(e) => e.stopPropagation()}
                                disabled={!fileKey}
                                className="rounded border-border shrink-0 mt-0.5"
                              />
                              <div className="min-w-0 flex-1">
                                <div
                                  className="truncate text-foreground"
                                  title={file.key}
                                >
                                  {file.name ?? file.key}
                                </div>
                                <div className="text-muted-foreground">
                                  {formatBytes(file.size)}
                                </div>
                              </div>
                            </div>

                            {/* Badges */}
                            {isOriginal && (
                              <span className="absolute top-1.5 right-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-500/10 text-green-600">
                                keep
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 p-4 border-t border-muted/10">
            <button
              onClick={handleClose}
              className="rounded-md px-3 py-1 text-sm hover:bg-muted/10"
            >
              Close
            </button>
            <button
              onClick={handleDeleteRequest}
              disabled={selectedKeys.size === 0}
              className="rounded-md px-3 py-1 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Selected ({selectedKeys.size})
            </button>
          </div>
        </>
      ) : null}

      {/* Results — confirm deletion */}
      {hasGroups && deletePhase === "confirm" ? (
        <>
          <div className="p-4 text-sm space-y-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Confirm deletion</span>
            </div>
            <p className="text-muted-foreground">
              Are you sure you want to permanently delete{" "}
              <span className="font-medium text-foreground">
                {selectedKeys.size} file
                {selectedKeys.size !== 1 ? "s" : ""}
              </span>
              ? This will free up{" "}
              <span className="font-medium text-foreground">
                {formatBytes(totalSelectedSize)}
              </span>
              .
            </p>
            <p className="text-xs text-muted-foreground">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 p-4 border-t border-muted/10">
            <button
              onClick={cancelDelete}
              className="rounded-md px-3 py-1 text-sm hover:bg-muted/10"
            >
              Cancel
            </button>
            <button
              onClick={() => void confirmDelete()}
              className="rounded-md px-3 py-1 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </>
      ) : null}

      {/* Results — deleting */}
      {hasGroups && deletePhase === "deleting" ? (
        <div className="p-6 text-sm flex flex-col items-center gap-3">
          <div className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <p className="text-muted-foreground">
            Deleting {selectedKeys.size} file
            {selectedKeys.size !== 1 ? "s" : ""}...
          </p>
        </div>
      ) : null}

      {/* Results — delete success */}
      {hasGroups && deletePhase === "success" ? (
        <>
          <div className="p-4 text-sm space-y-3">
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Deleted successfully</span>
            </div>
            <p className="text-muted-foreground">
              {deletedCount} file{deletedCount !== 1 ? "s" : ""} deleted,
              freeing up {formatBytes(deletedBytes)}.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 p-4 border-t border-muted/10">
            <button
              onClick={handleClose}
              className="rounded-md px-3 py-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        </>
      ) : null}

      {/* Results — delete error */}
      {hasGroups && deletePhase === "error" ? (
        <>
          <div className="p-4 text-sm space-y-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Deletion failed</span>
            </div>
            {deleteError && (
              <p className="text-muted-foreground">{deleteError}</p>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 p-4 border-t border-muted/10">
            <button
              onClick={cancelDelete}
              className="rounded-md px-3 py-1 text-sm hover:bg-muted/10"
            >
              Back to results
            </button>
            <button
              onClick={() => void confirmDelete()}
              className="rounded-md px-3 py-1 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Retry
            </button>
          </div>
        </>
      ) : null}

      {/* Results — no duplicates */}
      {showResults && !job.result?.totalDuplicateGroups ? (
        <>
          <div className="p-4 text-sm space-y-3">
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">No duplicates detected</span>
            </div>
            <p className="text-muted-foreground">
              Scanned {job.result?.totalFilesScanned ?? 0} files. No duplicates
              were found.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 p-4 border-t border-muted/10">
            <button
              onClick={handleClose}
              className="rounded-md px-3 py-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        </>
      ) : null}

      {/* Failed */}
      {showFailed && (
        <>
          <div className="p-4 text-sm space-y-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Scan failed</span>
            </div>
            {job.error && <p className="text-muted-foreground">{job.error}</p>}
          </div>
          <div className="flex items-center justify-end gap-3 p-4 border-t border-muted/10">
            <button
              onClick={handleClose}
              className="rounded-md px-3 py-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        </>
      )}

      {/* Cancelled */}
      {showCancelled && (
        <>
          <div className="p-4 text-sm space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Ban className="h-5 w-5" />
              <span className="font-medium">Scan was cancelled</span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 p-4 border-t border-muted/10">
            <button
              onClick={handleClose}
              className="rounded-md px-3 py-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        </>
      )}
    </BaseDialog>
  );
}
