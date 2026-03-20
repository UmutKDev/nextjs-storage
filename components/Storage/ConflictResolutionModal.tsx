"use client";

import React from "react";
import { AlertTriangle, X, FileIcon, FolderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import BaseDialog from "./BaseDialog";
import type {
  ConflictDetailModel,
  ConflictDetailsResponseModel,
} from "@/Service/Generates/api";

export type ConflictStrategy = "REPLACE" | "SKIP" | "KEEP_BOTH";

type ConflictResolutionModalProps = {
  open: boolean;
  onClose: () => void;
  conflicts: ConflictDetailsResponseModel | null;
  onResolve: (strategy: ConflictStrategy) => void;
  loading?: boolean;
  /** Label for the operation, e.g. "Move", "Rename", "Upload" */
  operationLabel?: string;
};

function formatSize(bytes?: number): string {
  if (bytes == null || bytes === 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(iso?: string): string {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function ConflictItem({ detail }: { detail: ConflictDetailModel }) {
  const Icon = detail.Source.IsDirectory ? FolderIcon : FileIcon;
  return (
    <div className="rounded-md border border-border bg-muted/20 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium truncate">
          {detail.Source.Name}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <div>
          <span className="font-medium text-foreground/70">Source</span>
          <div>Size: {formatSize(detail.Source.Size)}</div>
          <div>Modified: {formatDate(detail.Source.LastModified)}</div>
        </div>
        <div>
          <span className="font-medium text-foreground/70">Already exists</span>
          <div>Size: {formatSize(detail.Target.Size)}</div>
          <div>Modified: {formatDate(detail.Target.LastModified)}</div>
        </div>
      </div>
    </div>
  );
}

export default function ConflictResolutionModal({
  open,
  onClose,
  conflicts,
  onResolve,
  loading = false,
  operationLabel = "Operation",
}: ConflictResolutionModalProps) {
  const conflictList = conflicts?.Conflicts ?? [];
  const conflictCount = conflicts?.ConflictCount ?? conflictList.length;
  const totalItems = conflicts?.TotalItems ?? conflictCount;

  return (
    <BaseDialog
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && onClose()}
      closeOnOverlayClick={!loading}
      panelClassName="relative z-10 w-[95vw] max-w-lg rounded-xl bg-card border border-border shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-muted/10">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <div className="text-sm font-semibold">
            {conflictCount === 1
              ? "File conflict detected"
              : `${conflictCount} conflicts detected`}
          </div>
        </div>
        <button
          onClick={onClose}
          disabled={loading}
          className="rounded-md p-1 hover:bg-muted/10 disabled:opacity-50"
        >
          <X size={18} />
        </button>
      </div>

      {/* Description */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-sm text-muted-foreground">
          {totalItems > conflictCount
            ? `${conflictCount} of ${totalItems} items already exist at the destination.`
            : conflictCount === 1
              ? "The destination already contains an item with the same name."
              : `All ${conflictCount} items already exist at the destination.`}
        </p>
      </div>

      {/* Conflict list */}
      <div className="px-4 py-2 max-h-[240px] overflow-y-auto space-y-2">
        {conflictList.map((detail, i) => (
          <ConflictItem key={detail.Source.Key || i} detail={detail} />
        ))}
      </div>

      {/* Action buttons */}
      <div className="p-4 border-t border-muted/10 space-y-2">
        <p className="text-xs text-muted-foreground mb-3">
          Choose how to handle{" "}
          {conflictCount === 1 ? "this conflict" : "these conflicts"}:
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="sm:order-first"
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onResolve("SKIP")}
            disabled={loading}
          >
            {loading ? "Processing..." : "Skip"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onResolve("KEEP_BOTH")}
            disabled={loading}
          >
            {loading ? "Processing..." : "Keep Both"}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => onResolve("REPLACE")}
            disabled={loading}
          >
            {loading ? "Processing..." : "Replace"}
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
}
