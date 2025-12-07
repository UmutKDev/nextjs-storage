"use client";

import React from "react";
import { MoreHorizontal, Folder, Trash2, LayoutGrid, List as ListIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { useStorage } from "./StorageProvider";
import { cloudApiFactory } from "@/Service/Factories";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import EditFileModal from "./EditFileModal";
import { motion } from "framer-motion";
import FileIcon from "./FileIcon";
import { Button } from "@/components/ui/button";

import type { CloudObjectModel, CloudDirectoryModel } from "@/Service/Generates/api";
import { createCloudObjectsQueryKey, useCloudList } from "@/hooks/useCloudList";
import useUserStorageUsage from "@/hooks/useUserStorageUsage";

type CloudObject = CloudObjectModel;
type Directory = CloudDirectoryModel;

function humanFileSize(bytes?: number) {
  if (!bytes || bytes === 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
}

export type ViewMode = "list" | "grid";

export default function StorageBrowser({
  directories,
  contents,
  onPreview,
  loading = false,
  viewMode = "list",
  onViewModeChange,
}: {
  directories?: Directory[];
  contents?: CloudObject[];
  onPreview?: (file: CloudObject) => void;
  loading?: boolean;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}) {
  const qc = useQueryClient();
  const { currentPath, setCurrentPath } = useStorage();
  const { invalidate: invalidateUsage } = useUserStorageUsage();
  const { invalidates: invalidatesObjects } = useCloudList(currentPath);
  const [deleting, setDeleting] = React.useState<Record<string, boolean>>({});
  const [toDelete, setToDelete] = React.useState<CloudObject | null>(null);
  const [toEdit, setToEdit] = React.useState<CloudObject | null>(null);

  const isEmpty = (!directories?.length && !contents?.length) && !loading;

  if (isEmpty) return null;

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

  async function performUpdate(
    file: CloudObject,
    payload: { name?: string; metadata?: Record<string, string> }
  ) {
    const key = file?.Path?.Key;
    if (!key) return toast.error("Unable to update: missing key");

    // mark updating (UI state handled in modal)

    const listQueryKey = createCloudObjectsQueryKey(currentPath, true, false);
    const objectsQueryKey = createCloudObjectsQueryKey(currentPath);

    const prevList = qc.getQueryData(
      createCloudObjectsQueryKey(currentPath, true, false)
    );
    const prevObjects = qc.getQueryData(
      createCloudObjectsQueryKey(currentPath)
    );

    try {
      // Prepare name value including extension (server expects full filename)
      const nameToSend =
        payload.name && file.Extension
          ? `${payload.name}.${String(file.Extension).replace(/^\./, "")}`
          : payload.name ?? undefined;

      // Merge incoming metadata with existing to preserve default model fields
      const mergedMetadata = {
        ...(file?.Metadata ?? {}),
        ...(payload.metadata ?? {}),
      };

      // optimistic update: update cached objects
      qc.setQueryData(listQueryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: [
            ...old.data.result.items.map((c: any) =>
              c?.Path?.Key === key
                ? { ...c, Name: nameToSend ?? c.Name, Metadata: mergedMetadata }
                : c
            ),
          ],
        };
      });

      qc.setQueryData(objectsQueryKey, (old: any) =>
        Array.isArray(old)
          ? old.map((o: any) =>
              o?.Path?.Key === key
                ? { ...o, Name: nameToSend ?? o.Name, Metadata: mergedMetadata }
                : o
            )
          : old
      );

      // call server
      await cloudApiFactory.update({
        cloudUpdateRequestModel: {
          Key: key,
          Name: nameToSend,
          Metadata: mergedMetadata,
        },
      });

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

  const renderList = () => (
    <div className="divide-y rounded-md border bg-background/50">
      {/* Directories */}
      {(directories ?? []).map((d, idx) => {
        const prefix = d?.Prefix ?? "";
        const segments = prefix.split("/").filter(Boolean);
        const name = segments.length
          ? segments[segments.length - 1]
          : prefix || "";

        return (
          <motion.div
            layout
            key={`dir-${prefix || idx}`}
            onClick={() =>
              !loading &&
              setCurrentPath(currentPath ? `${currentPath}/${name}` : name)
            }
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            whileHover={{ scale: 1.005 }}
            transition={{ duration: 0.16 }}
            className="flex items-center gap-4 px-4 py-3 hover:bg-muted/10 cursor-pointer group"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
              <Folder size={18} fill="currentColor" className="opacity-80" />
            </div>
            <div className="flex-1 min-w-0 font-medium text-sm">
              {name}
            </div>
            <div className="text-xs text-muted-foreground">Folder</div>
          </motion.div>
        );
      })}

      {/* Files */}
      {(loading ? Array.from({ length: 4 }) : contents ?? []).map(
        (item: unknown, idx) => {
          const c = loading ? undefined : (item as CloudObject);
          return (
            <motion.div
              layout
              key={c?.Path?.Key ?? `file-${idx}`}
              onClick={() => !loading && c && onPreview?.(c)}
              role={onPreview && !loading ? "button" : undefined}
              tabIndex={onPreview && !loading ? 0 : undefined}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              whileHover={{ scale: 1.005 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-4 px-4 py-3 hover:bg-muted/10 cursor-pointer group"
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
                    c!.MimeType ?? "—"
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="whitespace-nowrap hidden sm:block">
                  {loading ? (
                    <div className="h-3 w-14 rounded bg-muted/30 animate-pulse" />
                  ) : (
                    humanFileSize(c!.Size)
                  )}
                </div>
                <div className="whitespace-nowrap hidden md:block">
                  {c?.LastModified
                    ? new Date(c!.LastModified).toLocaleString()
                    : "—"}
                </div>
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
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
        }
      )}
    </div>
  );

  const renderGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {/* Directories */}
      {(directories ?? []).map((d, idx) => {
        const prefix = d?.Prefix ?? "";
        const segments = prefix.split("/").filter(Boolean);
        const name = segments.length
          ? segments[segments.length - 1]
          : prefix || "";

        return (
          <motion.div
            layout
            key={`dir-${prefix || idx}`}
            onClick={() =>
              !loading &&
              setCurrentPath(currentPath ? `${currentPath}/${name}` : name)
            }
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.16 }}
            className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border bg-card hover:bg-accent/50 cursor-pointer transition-colors aspect-square text-center"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
              <Folder size={24} fill="currentColor" className="opacity-80" />
            </div>
            <div className="font-medium text-sm truncate w-full px-2">
              {name}
            </div>
            <div className="text-xs text-muted-foreground">Folder</div>
          </motion.div>
        );
      })}

      {/* Files */}
      {(loading ? Array.from({ length: 4 }) : contents ?? []).map(
        (item: unknown, idx) => {
          const c = loading ? undefined : (item as CloudObject);
          return (
            <motion.div
              layout
              key={c?.Path?.Key ?? `file-${idx}`}
              onClick={() => !loading && c && onPreview?.(c)}
              role={onPreview && !loading ? "button" : undefined}
              tabIndex={onPreview && !loading ? 0 : undefined}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.18 }}
              className="relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl border bg-card hover:bg-accent/50 cursor-pointer transition-colors aspect-square text-center group"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-md bg-muted/20">
                {loading ? (
                  <div className="h-8 w-8 rounded bg-muted/30 animate-pulse" />
                ) : (
                  <FileIcon extension={c!.Extension} className="w-8 h-8" />
                )}
              </div>

              <div className="w-full min-w-0">
                <div className="text-sm font-medium text-foreground truncate w-full px-2" title={c?.Name}>
                  {loading ? (
                    <div className="h-3 w-20 mx-auto rounded bg-muted/30 animate-pulse" />
                  ) : (
                    c!.Metadata?.Originalfilename || c!.Name
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {loading ? (
                    <div className="h-2 w-12 mx-auto rounded bg-muted/30 animate-pulse" />
                  ) : (
                    humanFileSize(c!.Size)
                  )}
                </div>
              </div>

              {!loading && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    aria-label={`Delete ${c!.Name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(c!);
                    }}
                    className="rounded p-1.5 bg-background/80 hover:bg-destructive/10 hover:text-destructive shadow-sm border"
                  >
                    <Trash2 size={14} />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="rounded p-1.5 bg-background/80 hover:bg-muted shadow-sm border"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setToEdit(c!);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </motion.div>
          );
        }
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {directories?.length || 0} folders, {contents?.length || 0} files
        </div>
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2"
            onClick={() => onViewModeChange?.("list")}
          >
            <ListIcon size={16} />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2"
            onClick={() => onViewModeChange?.("grid")}
          >
            <LayoutGrid size={16} />
          </Button>
        </div>
      </div>

      {viewMode === "list" ? renderList() : renderGrid()}

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
