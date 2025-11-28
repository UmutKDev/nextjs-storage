"use client";

import React from "react";
import { MoreHorizontal } from "lucide-react";
import { Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useStorage } from "./StorageProvider";
import { cloudApiFactory } from "@/Service/Factories";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { motion } from "framer-motion";
import FileIcon from "./FileIcon";

import type { CloudObjectModel } from "@/Service/Generates/api";
import { createCloudObjectsQueryKey, useCloudList } from "@/hooks/useCloudList";
import useUserStorageUsage from "@/hooks/useUserStorageUsage";

// use the generated CloudObjectModel for accurate typing
type CloudObject = CloudObjectModel;

function humanFileSize(bytes?: number) {
  if (!bytes || bytes === 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
}

export default function ContentsList({
  contents,
  onPreview,
  loading = false,
  skeletonCount = 4,
}: {
  contents?: CloudObject[];
  onPreview?: (file: CloudObject) => void;
  loading?: boolean;
  skeletonCount?: number;
}) {
  const qc = useQueryClient();
  const { currentPath } = useStorage();
  const { invalidate: invalidateUsage } = useUserStorageUsage();
  const { invalidates: invalidatesObjects } = useCloudList(currentPath);
  const [deleting, setDeleting] = React.useState<Record<string, boolean>>({});
  const [toDelete, setToDelete] = React.useState<CloudObject | null>(null);

  if ((!contents || contents.length === 0) && !loading) return null;

  function handleDelete(file: CloudObject) {
    setToDelete(file);
  }

  async function performDelete(file: CloudObject) {
    const key = file?.Path?.Key;
    if (!key) return toast.error("Unable to delete: missing key");

    setDeleting((s) => ({ ...s, [key]: true }));

    const listQueryKey = createCloudObjectsQueryKey(currentPath, true, false);
    const objectsQueryKey = createCloudObjectsQueryKey(currentPath);

    const prevList = qc.getQueryData(
      createCloudObjectsQueryKey(currentPath, true, false)
    );
    const prevObjects = qc.getQueryData(
      createCloudObjectsQueryKey(currentPath)
    );
    try {
      // optimistic update: remove the file from the cached lists immediately

      qc.setQueryData(listQueryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: [
            ...old.data.result.items.filter((c: any) => c?.Path?.Key !== key),
          ],
        };
      });

      qc.setQueryData(objectsQueryKey, (old: any) =>
        Array.isArray(old) ? old.filter((o: any) => o?.Path?.Key !== key) : old
      );

      // call server to remove file
      await cloudApiFactory._delete({
        cloudDeleteRequestModel: { Key: [key], IsDirectory: false },
      });

      // success — keep optimistic state and refresh other queries that may be affected
      toast.success("Deleted");
      await invalidateUsage();
      await invalidatesObjects.invalidateObjects();
    } catch (err) {
      // rollback optimistic update on error
      try {
        qc.setQueryData(listQueryKey, prevList);
        qc.setQueryData(objectsQueryKey, prevObjects);
      } catch (rollbackErr) {
        console.error("Rollback failed", rollbackErr);
      }
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setDeleting((s) => ({ ...s, [key]: false }));
    }
  }

  return (
    <div className="divide-y rounded-md border bg-background/50">
      {(loading ? Array.from({ length: skeletonCount }) : contents ?? []).map(
        (item: unknown, idx) => {
          const c = loading ? undefined : (item as CloudObject);
          return (
            <motion.div
              layout
              key={c?.Path?.Key ?? `${c?.Name}-${idx}`}
              onClick={() => !loading && c && onPreview?.(c)}
              role={onPreview && !loading ? "button" : undefined}
              tabIndex={onPreview && !loading ? 0 : undefined}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-4 px-4 py-3 hover:bg-muted/10 cursor-pointer"
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-md bg-muted/20">
                {loading ? (
                  <div className="h-5 w-5 rounded bg-muted/30 animate-pulse" />
                ) : (
                  <FileIcon extension={c!.Extension} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground truncate">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-48 rounded bg-muted/30 animate-pulse" />
                      <div className="h-3 w-10 rounded bg-muted/30 animate-pulse" />
                    </div>
                  ) : (
                    <>
                      {c!.Metadata.originalfilename}
                      <span className="text-xs text-muted-foreground">
                        .{c!.Extension}
                      </span>
                    </>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {loading ? (
                    <div className="h-3 w-24 rounded bg-muted/30 animate-pulse" />
                  ) : (
                    c!.MimeType ?? "—"
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="whitespace-nowrap">
                  {loading ? (
                    <div className="h-3 w-14 rounded bg-muted/30 animate-pulse" />
                  ) : (
                    humanFileSize(c!.Size)
                  )}
                </div>
                <div className="whitespace-nowrap">
                  {c?.LastModified
                    ? new Date(c!.LastModified).toLocaleString()
                    : "—"}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    aria-label={`Delete ${loading ? "item" : c!.Name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!loading && c) handleDelete(c);
                    }}
                    className="rounded p-1 hover:bg-muted/10"
                    disabled={
                      loading ||
                      Boolean(deleting[c!.Path?.Key ?? c!.Name ?? String(idx)])
                    }
                  >
                    {loading ? (
                      <div className="h-4 w-4 rounded bg-muted/30 animate-pulse" />
                    ) : (
                      <Trash2 className="size-4 text-destructive" />
                    )}
                  </button>

                  <MoreHorizontal size={16} className="text-muted-foreground" />
                </div>
              </div>
            </motion.div>
          );
        }
      )}
      <ConfirmDeleteModal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        name={toDelete?.Name ?? toDelete?.Path?.Key}
        description={toDelete?.Path?.Key}
        onConfirm={async () => {
          if (!toDelete) return;
          await performDelete(toDelete);
          setToDelete(null);
        }}
      />
    </div>
  );
}
