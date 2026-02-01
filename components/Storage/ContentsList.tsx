"use client";

import React from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useStorage } from "./StorageProvider";
import { cloudApiFactory } from "@/Service/Factories";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import EditFileModal from "./EditFileModal";
import { motion } from "framer-motion";
import FileIcon from "./FileIcon";
import { useEncryptedFolders } from "./stores/encryptedFolders.store";

import type {
  CloudObjectListBaseModel,
  CloudObjectModel,
} from "@/Service/Generates/api";
import { createCloudObjectsQueryKey, useCloudList } from "@/hooks/useCloudList";
import useUserStorageUsage from "@/hooks/useUserStorageUsage";
import { AxiosResponse } from "axios";
import { createIdempotencyKey } from "@/lib/idempotency";

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
  const { getSessionToken } = useEncryptedFolders((state) => ({
    getSessionToken: state.getSessionToken,
  }));
  // only need invalidation helpers here — don't run the list queries to avoid duplicate requests
  const { invalidates: invalidatesObjects } = useCloudList(currentPath, {
    enabled: false,
  });
  const [deleting, setDeleting] = React.useState<Record<string, boolean>>({});
  const [toDelete, setToDelete] = React.useState<CloudObject | null>(null);
  const [toEdit, setToEdit] = React.useState<CloudObject | null>(null);

  if ((!contents || contents.length === 0) && !loading) return null;

  function handleDelete(file: CloudObject) {
    setToDelete(file);
  }

  async function performDelete(file: CloudObject) {
    const key = file?.Path?.Key;
    if (!key) return toast.error("Unable to delete: missing key");
    const sessionToken = getSessionToken(key || currentPath);
    const sessionOptions = sessionToken
      ? { headers: { "x-folder-session": sessionToken } }
      : undefined;

    setDeleting((s) => ({ ...s, [key]: true }));

    const listQueryKey = createCloudObjectsQueryKey(currentPath, true, false);
    const objectsQueryKey = createCloudObjectsQueryKey(currentPath);

    const prevList = qc.getQueryData(
      createCloudObjectsQueryKey(currentPath, true, false),
    );
    const prevObjects = qc.getQueryData(
      createCloudObjectsQueryKey(currentPath),
    );
    try {
      // optimistic update: remove the file from the cached lists immediately

      qc.setQueryData(
        listQueryKey,
        (old: AxiosResponse<CloudObjectListBaseModel>) => {
          if (!old) return old;
          return {
            ...old,
            items: [
              ...old.data.Result.Items.filter((c) => c?.Path?.Key !== key),
            ],
          };
        },
      );

      qc.setQueryData(objectsQueryKey, (old: CloudObject[]) =>
        Array.isArray(old)
          ? old.filter((o: CloudObject) => o?.Path?.Key !== key)
          : old,
      );

      // call server to remove file
      await cloudApiFactory._delete(
        {
          idempotencyKey: createIdempotencyKey(),
          cloudDeleteRequestModel: {
            Items: [{ Key: key, IsDirectory: false }],
          },
        },
        sessionOptions,
      );

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

  async function performUpdate(
    file: CloudObject,
    payload: { name?: string; metadata?: Record<string, string> },
  ) {
    const key = file?.Path?.Key;
    if (!key) return toast.error("Unable to update: missing key");
    const sessionToken = getSessionToken(key || currentPath);
    const sessionOptions = sessionToken
      ? { headers: { "x-folder-session": sessionToken } }
      : undefined;

    // mark updating (UI state handled in modal)

    const listQueryKey = createCloudObjectsQueryKey(currentPath, true, false);
    const objectsQueryKey = createCloudObjectsQueryKey(currentPath);

    const prevList = qc.getQueryData(
      createCloudObjectsQueryKey(currentPath, true, false),
    );
    const prevObjects = qc.getQueryData(
      createCloudObjectsQueryKey(currentPath),
    );

    try {
      // Prepare name value including extension (server expects full filename)
      const nameToSend =
        payload.name && file.Extension
          ? `${payload.name}.${String(file.Extension).replace(/^\./, "")}`
          : (payload.name ?? undefined);

      // Merge incoming metadata with existing to preserve default model fields
      const mergedMetadata = {
        ...(file?.Metadata ?? {}),
        ...(payload.metadata ?? {}),
      };

      // optimistic update: update cached objects
      qc.setQueryData(
        listQueryKey,
        (old: AxiosResponse<CloudObjectListBaseModel>) => {
          if (!old) return old;
          return {
            ...old,
            items: [
              ...old.data.Result.Items.map((c) =>
                c?.Path?.Key === key
                  ? {
                      ...c,
                      Name: nameToSend ?? c.Name,
                      Metadata: mergedMetadata,
                    }
                  : c,
              ),
            ],
          };
        },
      );

      qc.setQueryData(
        objectsQueryKey,
        (old: AxiosResponse<CloudObjectListBaseModel>) =>
          Array.isArray(old)
            ? old.map((o) =>
                o?.Path?.Key === key
                  ? {
                      ...o,
                      Name: nameToSend ?? o.Name,
                      Metadata: mergedMetadata,
                    }
                  : o,
              )
            : old,
      );

      // call server
      await cloudApiFactory.update(
        {
          cloudUpdateRequestModel: {
            Key: key,
            Name: nameToSend,
            Metadata: mergedMetadata,
          },
        },
        sessionOptions,
      );

      toast.success("Updated");
      await invalidateUsage();
      await invalidatesObjects.invalidateObjects();
    } catch (err) {
      // rollback
      try {
        qc.setQueryData(listQueryKey, prevList);
        qc.setQueryData(objectsQueryKey, prevObjects);
      } catch (rollbackErr) {
        console.error("Rollback failed", rollbackErr);
      }
      console.error(err);
      toast.error("Update failed");
    } finally {
      // done
    }
  }

  return (
    <div className="divide-y rounded-md border bg-background/50">
      {(loading ? Array.from({ length: skeletonCount }) : (contents ?? [])).map(
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
                      {c!.Metadata?.Originalfilename || c!.Name}
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
                    (c!.MimeType ?? "—")
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

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`More ${loading ? "item" : c!.Name}`}
                        className="rounded p-1 hover:bg-muted/10"
                      >
                        <MoreHorizontal
                          size={16}
                          className="text-muted-foreground"
                        />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" forceMount>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!loading && c) setToEdit(c);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          );
        },
      )}
      <ConfirmDeleteModal
        open={Boolean(toDelete)}
        onOpenChange={(open: boolean) => {
          if (!open) setToDelete(null);
        }}
        title={toDelete?.Name ?? toDelete?.Path?.Key}
        description={toDelete?.Path?.Key}
        onConfirm={async () => {
          if (!toDelete) return;
          await performDelete(toDelete);
          setToDelete(null);
        }}
      />
      <EditFileModal
        open={Boolean(toEdit)}
        onClose={() => setToEdit(null)}
        file={toEdit ?? undefined}
        onConfirm={async ({ name, metadata }) => {
          if (!toEdit) return;
          await performUpdate(toEdit, { name, metadata });
          setToEdit(null);
        }}
      />
    </div>
  );
}
