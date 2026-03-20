"use client";

import React from "react";
import {
  History,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cloudApiFactory } from "@/Service/Factories";
import type { CloudVersionModel } from "@/Service/Generates/api";

function humanFileSize(bytes?: number) {
  if (!bytes || bytes === 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
}

export default function VersionHistoryPanel({
  fileKey,
  onRestored,
}: {
  fileKey: string;
  onRestored?: () => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const [versions, setVersions] = React.useState<CloudVersionModel[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const fetchedKeyRef = React.useRef<string | null>(null);

  const fetchVersions = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await cloudApiFactory.listVersions({ key: fileKey });
      setVersions(resp.data.Result.Versions);
      fetchedKeyRef.current = fileKey;
    } catch {
      setError("Failed to load versions.");
      setVersions([]);
    } finally {
      setLoading(false);
    }
  }, [fileKey]);

  // Fetch when expanded or when fileKey changes while expanded
  React.useEffect(() => {
    if (expanded && fetchedKeyRef.current !== fileKey) {
      fetchVersions();
    }
  }, [expanded, fileKey, fetchVersions]);

  const handleToggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && fetchedKeyRef.current !== fileKey) {
      fetchVersions();
    }
  };

  const handleRestore = async (version: CloudVersionModel) => {
    if (actionLoading) return;
    setActionLoading(version.VersionId);
    try {
      await cloudApiFactory.restoreVersion({
        cloudRestoreVersionRequestModel: {
          Key: fileKey,
          VersionId: version.VersionId,
        },
      });
      await fetchVersions();
      onRestored?.();
    } catch {
      setError("Restore failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (version: CloudVersionModel) => {
    if (actionLoading) return;
    setActionLoading(version.VersionId);
    try {
      await cloudApiFactory.deleteVersion({
        cloudDeleteVersionRequestModel: {
          Key: fileKey,
          VersionId: version.VersionId,
        },
      });
      setVersions((prev) =>
        prev.filter((v) => v.VersionId !== version.VersionId),
      );
    } catch {
      setError("Delete failed.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="border-t border-border/40">
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 w-full px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
      >
        <History size={14} />
        <span className="font-medium">Version History</span>
        {versions.length > 0 && expanded && (
          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">
            {versions.length}
          </span>
        )}
        <span className="ml-auto">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-3 max-h-48 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-4 text-muted-foreground">
              <Loader2 size={16} className="animate-spin mr-2" />
              <span className="text-xs">Loading versions...</span>
            </div>
          )}

          {error && !loading && (
            <div className="text-xs text-destructive py-2">{error}</div>
          )}

          {!loading && !error && versions.length === 0 && (
            <div className="text-xs text-muted-foreground py-3 text-center">
              No previous versions available.
            </div>
          )}

          {!loading &&
            versions.map((version) => (
              <div
                key={version.VersionId}
                className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-b-0 gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-foreground truncate">
                    {new Date(version.LastModified).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {humanFileSize(version.Size)}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    title="Restore this version"
                    disabled={actionLoading !== null}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestore(version);
                    }}
                  >
                    {actionLoading === version.VersionId ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <RotateCcw size={12} />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    title="Delete this version"
                    disabled={actionLoading !== null}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(version);
                    }}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
