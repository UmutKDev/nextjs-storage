"use client";

import React from "react";
import { MoreHorizontal } from "lucide-react";
import { Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cloudApiFactory } from "@/Service/Factories";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { motion } from "framer-motion";
import FileIcon from "./FileIcon";

import type { CloudObjectModel } from "@/Service/Generates/api";

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
}: {
  contents?: CloudObject[];
  onPreview?: (file: CloudObject) => void;
}) {
  if (!contents || contents.length === 0) return null;

  const qc = useQueryClient();
  const [deleting, setDeleting] = React.useState<Record<string, boolean>>({});
  const [toDelete, setToDelete] = React.useState<CloudObject | null>(null);

  function handleDelete(file: CloudObject) {
    setToDelete(file);
  }

  async function performDelete(file: CloudObject) {
    const key = file?.Path?.Key;
    if (!key) return toast.error("Unable to delete: missing key");

    setDeleting((s) => ({ ...s, [key]: true }));
    try {
      await cloudApiFactory._delete({ cloudDeleteRequestModel: { Key: [key], IsDirectory: false } });
      toast.success("Deleted");
      await qc.invalidateQueries({ queryKey: ["cloud", "list"] });
      await qc.invalidateQueries({ queryKey: ["cloud-root-folders"] });
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setDeleting((s) => ({ ...s, [key]: false }));
    }
  }

  return (
    <div className="divide-y rounded-md border bg-background/50">
      {contents.map((c, idx) => (
        <motion.div
          layout
          key={c.Path?.Key ?? `${c.Name}-${idx}`}
          onClick={() => onPreview?.(c)}
          role={onPreview ? "button" : undefined}
          tabIndex={onPreview ? 0 : undefined}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.18 }}
          className="flex items-center gap-4 px-4 py-3 hover:bg-muted/10 cursor-pointer"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-md bg-muted/20">
            <FileIcon extension={c.Extension} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground truncate">
              {c.Name}
              <span className="text-xs text-muted-foreground">
                .{c.Extension}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {c.MimeType ?? "—"}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="whitespace-nowrap">{humanFileSize(c.Size)}</div>
            <div className="whitespace-nowrap">
              {c.LastModified ? new Date(c.LastModified).toLocaleString() : "—"}
            </div>
            <div className="flex items-center gap-3">
              <button
                aria-label={`Delete ${c.Name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(c);
                }}
                className="rounded p-1 hover:bg-muted/10"
                disabled={Boolean(deleting[c.Path?.Key ?? c.Name ?? String(idx)])}
              >
                <Trash2 className="size-4 text-destructive" />
              </button>

              <MoreHorizontal size={16} className="text-muted-foreground" />
            </div>
          </div>
        </motion.div>
      ))}
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
