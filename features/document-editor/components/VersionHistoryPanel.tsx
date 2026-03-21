"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Trash2,
  GitCompare,
} from "lucide-react";
import DocumentDiffViewer from "./DocumentDiffViewer";
import type { DocumentDiffResponseModel } from "@/types/document.types";

interface VersionItem {
  VersionId: string;
  LastModified: string;
  Size: number;
  IsLatest?: boolean;
}

export default function VersionHistoryPanel({
  versions,
  isLoading,
  diff,
  isLoadingDiff,
  onLoadDiff,
  onClearDiff,
  onRestore,
  isRestoring,
  onDelete,
}: {
  versions: VersionItem[];
  isLoading: boolean;
  diff: DocumentDiffResponseModel | null;
  isLoadingDiff: boolean;
  onLoadDiff: (sourceVersionId: string, targetVersionId: string) => void;
  onClearDiff: () => void;
  onRestore: (versionId: string) => Promise<boolean>;
  isRestoring: boolean;
  onDelete: (versionId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDiffVersions, setSelectedDiffVersions] = useState<{
    source: string;
    target: string;
  } | null>(null);

  const handleDiff = (sourceVersionId: string, targetVersionId: string) => {
    setSelectedDiffVersions({
      source: sourceVersionId,
      target: targetVersionId,
    });
    onLoadDiff(sourceVersionId, targetVersionId);
  };

  const handleCloseDiff = () => {
    setSelectedDiffVersions(null);
    onClearDiff();
  };

  if (isLoading) {
    return (
      <div className="border-t border-border p-3 text-xs text-muted-foreground">
        Loading versions...
      </div>
    );
  }

  if (!versions.length) return null;

  return (
    <div className="border-t border-border">
      {/* Toggle header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs text-muted-foreground hover:bg-muted/30 transition-colors"
      >
        <span className="font-medium">Version History ({versions.length})</span>
        {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {isExpanded && (
        <div className="max-h-64 overflow-auto border-t border-border/50">
          {/* Diff viewer */}
          {diff && selectedDiffVersions && (
            <div className="p-3 border-b border-border/50 bg-muted/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Diff: {selectedDiffVersions.source.slice(0, 8)}... →{" "}
                  {selectedDiffVersions.target.slice(0, 8)}...
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={handleCloseDiff}
                >
                  Close
                </Button>
              </div>
              <DocumentDiffViewer diff={diff} />
            </div>
          )}

          {/* Version list */}
          {versions.map((version, idx) => (
            <div
              key={version.VersionId}
              className="flex items-center justify-between px-4 py-2 text-xs border-b border-border/30 last:border-b-0 hover:bg-muted/20"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-foreground font-mono truncate">
                  {version.VersionId.slice(0, 12)}...
                  {version.IsLatest && (
                    <span className="ml-1.5 text-[10px] bg-primary/20 text-primary px-1 rounded">
                      latest
                    </span>
                  )}
                </span>
                <span className="text-muted-foreground">
                  {new Date(version.LastModified).toLocaleString()} ·{" "}
                  {formatBytes(version.Size)}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {/* Diff with previous */}
                {idx < versions.length - 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    title="Compare with previous"
                    disabled={isLoadingDiff}
                    onClick={() =>
                      handleDiff(versions[idx + 1].VersionId, version.VersionId)
                    }
                  >
                    <GitCompare size={12} />
                  </Button>
                )}
                {/* Restore */}
                {!version.IsLatest && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    title="Restore this version"
                    disabled={isRestoring}
                    onClick={() => onRestore(version.VersionId)}
                  >
                    <RotateCcw size={12} />
                  </Button>
                )}
                {/* Delete */}
                {!version.IsLatest && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    title="Delete this version"
                    onClick={() => onDelete(version.VersionId)}
                  >
                    <Trash2 size={12} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatBytes(bytes?: number) {
  if (!bytes || bytes === 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const sizes = ["B", "KB", "MB", "GB"];
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
}
