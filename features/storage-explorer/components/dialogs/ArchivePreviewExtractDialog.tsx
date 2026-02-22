"use client";

import React from "react";
import {
  Archive,
  File,
  Folder,
  X,
  Loader2,
  AlertCircle,
  CheckSquare,
  Square,
} from "lucide-react";
import BaseDialog from "@/components/Storage/BaseDialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useExplorerActions } from "../../contexts/ExplorerActionsContext";
import { useArchivePreview } from "../../hooks/useArchivePreview";
import { getFileDisplayName } from "../../utils/item";
import type { CloudObjectModel } from "@/Service/Generates/api";

type ArchivePreviewExtractDialogProps = {
  open: boolean;
  payload: { file: CloudObjectModel } | null;
  onClose: () => void;
};

const humanReadableFileSize = (bytes?: number) => {
  if (!bytes || bytes === 0) return "0 B";
  const sizeIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  return (
    (bytes / Math.pow(1024, sizeIndex)).toFixed(1) + " " + sizes[sizeIndex]
  );
};

export default function ArchivePreviewExtractDialog({
  open,
  payload,
  onClose,
}: ArchivePreviewExtractDialogProps) {
  const { createArchiveExtractionJob } = useExplorerActions();
  const { previewState, fetchPreview, resetPreview } = useArchivePreview();
  const [selectedEntries, setSelectedEntries] = React.useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = React.useState(false);
  const file = payload?.file ?? null;

  React.useEffect(() => {
    if (open && file?.Path?.Key) {
      fetchPreview(file.Path.Key);
      setSelectedEntries(new Set());
    }
    if (!open) {
      resetPreview();
      setSelectedEntries(new Set());
    }
  }, [open, file?.Path?.Key, fetchPreview, resetPreview]);

  React.useEffect(() => {
    if (previewState.data?.Entries) {
      setSelectedEntries(new Set(previewState.data.Entries.map((e) => e.Path)));
    }
  }, [previewState.data]);

  const entries = previewState.data?.Entries ?? [];
  const allSelected =
    entries.length > 0 && selectedEntries.size === entries.length;
  const someSelected =
    selectedEntries.size > 0 && selectedEntries.size < entries.length;

  const toggleEntry = React.useCallback((path: string) => {
    setSelectedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const toggleAll = React.useCallback(() => {
    if (allSelected) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(entries.map((e) => e.Path)));
    }
  }, [allSelected, entries]);

  const handleExtract = React.useCallback(async () => {
    if (!file) return;
    setLoading(true);
    try {
      const selected = allSelected ? undefined : Array.from(selectedEntries);
      const totalEntries = allSelected
        ? previewState.data?.TotalEntries
        : selectedEntries.size;
      await createArchiveExtractionJob(file, selected, totalEntries);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [file, allSelected, selectedEntries, createArchiveExtractionJob, onClose, previewState.data?.TotalEntries]);

  return (
    <BaseDialog
      open={open && Boolean(file)}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      panelClassName="relative z-10 w-[95vw] max-w-2xl rounded-xl bg-card border border-border shadow-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-muted/10">
        <div className="flex items-center gap-2">
          <Archive className="text-primary" />
          <div className="text-sm font-semibold truncate max-w-[300px]">
            {file ? getFileDisplayName(file) : ""}
          </div>
          {previewState.data?.Format ? (
            <Badge variant="secondary" className="text-xs uppercase">
              {previewState.data.Format}
            </Badge>
          ) : null}
        </div>
        <button onClick={onClose} className="rounded-md p-1 hover:bg-muted/10">
          <X />
        </button>
      </div>

      <div className="p-4">
        {previewState.loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Arsiv icerigi yukleniyor...</span>
          </div>
        ) : previewState.error ? (
          <div className="flex items-center justify-center py-12 gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{previewState.error}</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <span className="text-sm">Arsiv bos veya icerik okunamadi</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={toggleAll}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {allSelected ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                {allSelected ? "Secimi kaldir" : "Tumunu sec"}
              </button>
              <span className="text-xs text-muted-foreground ml-auto">
                {selectedEntries.size} / {entries.length} secili
                {previewState.data?.TotalEntries
                  ? ` (toplam ${previewState.data.TotalEntries} oge)`
                  : ""}
              </span>
            </div>

            <div className="max-h-[400px] overflow-y-auto border rounded-md divide-y divide-border/50">
              {entries.map((entry) => (
                <div
                  key={entry.Path}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-muted/5 cursor-pointer"
                  onClick={() => toggleEntry(entry.Path)}
                >
                  <Checkbox
                    checked={selectedEntries.has(entry.Path)}
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={() => toggleEntry(entry.Path)}
                    className="shrink-0"
                  />
                  {entry.Type === "directory" ? (
                    <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <File className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-sm truncate flex-1" title={entry.Path}>
                    {entry.Path}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {humanReadableFileSize(entry.Size)}
                    </span>
                    {entry.CompressedSize != null &&
                    entry.CompressedSize !== entry.Size ? (
                      <span className="text-xs text-muted-foreground/60">
                        ({humanReadableFileSize(entry.CompressedSize)})
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 p-4 border-t border-muted/10">
        <button
          onClick={onClose}
          disabled={loading}
          className="rounded-md px-3 py-1 text-sm hover:bg-muted/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Iptal
        </button>
        <button
          onClick={handleExtract}
          disabled={
            loading || previewState.loading || selectedEntries.size === 0
          }
          className="rounded-md px-3 py-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <div className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : null}
          {selectedEntries.size > 0 && !allSelected
            ? `Secilenleri cikar (${selectedEntries.size})`
            : "Tumunu cikar"}
        </button>
      </div>
    </BaseDialog>
  );
}
