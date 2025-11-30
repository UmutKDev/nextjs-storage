"use client";

import type React from "react";
import { useRef } from "react";
import useUserStorageUsage from "@/hooks/useUserStorageUsage";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  Loader2,
  AlertCircle,
  Ban,
} from "lucide-react";
import { useStorage } from "./StorageProvider";
import { useFileUpload, type UploadItem } from "@/hooks/useFileUpload";

// Helper component for rendering a list of uploads
function UploadList({
  title,
  icon: Icon,
  items,
  onAction,
  actionIcon: ActionIcon,
  showProgress = false,
  variant = "default",
}: {
  title: string;
  icon: React.ElementType;
  items: UploadItem[];
  onAction: (id: string) => void;
  actionIcon: React.ElementType;
  showProgress?: boolean;
  variant?: "default" | "error" | "muted";
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="text-foreground text-lg flex items-center font-mono font-normal uppercase sm:text-xs mb-4">
        <Icon
          className={`size-4 mr-1 ${
            variant === "error" ? "text-destructive" : ""
          } ${title === "Uploading" ? "animate-spin" : ""}`}
        />
        {title}
      </h2>
      <div className="-mt-2 divide-y">
        {items.map((file) => (
          <div key={file.id} className="group flex items-center py-4">
            <div className="mr-3 grid size-10 shrink-0 place-content-center rounded border bg-muted">
              <FileText
                className={`inline size-4 ${
                  variant === "error" ? "text-destructive" : ""
                } group-hover:hidden`}
              />
              <Button
                variant="ghost"
                size="icon"
                className="hidden size-4 group-hover:inline p-0 h-auto"
                onClick={() => onAction(file.id)}
                aria-label="Action"
              >
                <ActionIcon className="size-4" />
              </Button>
            </div>
            <div className="flex flex-col w-full mb-1">
              <div className="flex justify-between gap-2">
                <span
                  className={`select-none text-base/6 text-foreground group-disabled:opacity-50 sm:text-sm/6 ${
                    variant === "error" ? "text-destructive" : ""
                  } ${
                    variant === "muted"
                      ? "text-muted-foreground line-through"
                      : ""
                  }`}
                >
                  {file.name}
                </span>
                <span className="text-muted-foreground text-sm tabular-nums">
                  {variant === "error"
                    ? "Failed"
                    : variant === "muted"
                    ? "Cancelled"
                    : `${file.progress}%`}
                </span>
              </div>
              {showProgress && (
                <Progress value={file.progress} className="mt-1 h-2 min-w-64" />
              )}
              {file.error && (
                <span className="text-xs text-destructive mt-1">
                  {file.error}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FileUpload() {
  const { currentPath } = useStorage();
  const { uploads, handleFiles, cancelUpload, removeUpload } =
    useFileUpload(currentPath);
  const filePickerRef = useRef<HTMLInputElement>(null);
  const { userStorageUsageQuery } = useUserStorageUsage();
  const maxUploadBytes = userStorageUsageQuery.data?.MaxUploadSizeBytes;
  const [rejectedFiles, setRejectedFiles] = useState<
    { name: string; size: number; reason: string }[]
  >([]);

  function humanFileSize(bytes?: number) {
    if (!bytes || bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
  }

  const openFilePicker = () => {
    filePickerRef.current?.click();
  };

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const files = Array.from(selectedFiles);
      if (typeof maxUploadBytes === "number") {
        const allowed: File[] = [];
        const rejected: File[] = [];
        files.forEach((f) => {
          if (f.size <= maxUploadBytes) allowed.push(f);
          else rejected.push(f);
        });

        if (rejected.length > 0) {
          setRejectedFiles((prev) => [
            ...prev,
            ...rejected.map((f) => ({
              name: f.name,
              size: f.size,
              reason: `Çok büyük — maksimum ${humanFileSize(maxUploadBytes)}`,
            })),
          ]);
        }

        if (allowed.length > 0) handleFiles(allowed);
      } else {
        handleFiles(files);
      }
    }
    // Reset input so same file can be selected again if needed
    if (filePickerRef.current) filePickerRef.current.value = "";
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const onDropFiles = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles) {
      const files = Array.from(droppedFiles);
      if (typeof maxUploadBytes === "number") {
        const allowed: File[] = [];
        const rejected: File[] = [];
        files.forEach((f) => {
          if (f.size <= maxUploadBytes) allowed.push(f);
          else rejected.push(f);
        });

        if (rejected.length > 0) {
          setRejectedFiles((prev) => [
            ...prev,
            ...rejected.map((f) => ({
              name: f.name,
              size: f.size,
              reason: `Çok büyük — maksimum ${humanFileSize(maxUploadBytes)}`,
            })),
          ]);
        }

        if (allowed.length > 0) handleFiles(allowed);
      } else {
        handleFiles(files);
      }
    }
  };

  const activeUploads = uploads.filter((f) => f.status === "uploading");
  const completedUploads = uploads.filter((f) => f.status === "completed");
  const failedUploads = uploads.filter((f) => f.status === "failed");
  const cancelledUploads = uploads.filter((f) => f.status === "cancelled");

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-y-6">
      {rejectedFiles.length > 0 && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <AlertCircle className="size-5 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <strong className="block">Dosya(lar) yüklenemedi</strong>
                <button
                  aria-label="Dismiss file warnings"
                  className="text-destructive/80 hover:text-destructive shrink-0"
                  onClick={() => setRejectedFiles([])}
                >
                  <X className="size-4" />
                </button>
              </div>

              <ul className="mt-3 space-y-2 text-sm text-destructive/90 max-h-48 overflow-auto">
                {rejectedFiles.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2"
                  >
                    <div className="wrap-break-word">{f.name}</div>
                    <div className="text-muted-foreground text-xs sm:text-sm">
                      {humanFileSize(f.size)} • {f.reason}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      <Card
        className="group flex max-h-[220px] w-full flex-col items-center justify-center gap-4 py-10 px-6 border-dashed text-sm cursor-pointer hover:bg-muted/50 transition-colors"
        onDragOver={onDragOver}
        onDrop={onDropFiles}
        onClick={openFilePicker}
      >
        <div className="grid space-y-3">
          <div className="flex items-center gap-x-2 text-muted-foreground">
            <Upload className="size-5" />
            <div>
              Drop files here or{" "}
              <Button
                variant="link"
                className="text-primary p-0 h-auto font-normal"
                onClick={(e) => {
                  e.stopPropagation();
                  openFilePicker();
                }}
              >
                browse files
              </Button>{" "}
              to add
            </div>
          </div>
        </div>
        <input
          ref={filePickerRef}
          type="file"
          className="hidden"
          accept="*"
          multiple
          onChange={onFileInputChange}
        />
        <span className="text-base/6 text-muted-foreground group-disabled:opacity-50 mt-2 block sm:text-xs">
          Supported: JPG, PNG, GIF (max{" "}
          {maxUploadBytes ? humanFileSize(maxUploadBytes) : "10 MB"})
        </span>
      </Card>

      <div className="flex flex-col gap-y-4">
        <UploadList
          title="Uploading"
          icon={Loader2}
          items={activeUploads}
          onAction={cancelUpload}
          actionIcon={X}
          showProgress={true}
        />

        {activeUploads.length > 0 &&
          (completedUploads.length > 0 ||
            failedUploads.length > 0 ||
            cancelledUploads.length > 0) && <Separator className="my-0" />}

        <UploadList
          title="Finished"
          icon={CheckCircle}
          items={completedUploads}
          onAction={removeUpload}
          actionIcon={X}
        />

        {completedUploads.length > 0 &&
          (failedUploads.length > 0 || cancelledUploads.length > 0) && (
            <Separator className="my-0" />
          )}

        <UploadList
          title="Failed"
          icon={AlertCircle}
          items={failedUploads}
          onAction={removeUpload}
          actionIcon={X}
          variant="error"
        />

        {failedUploads.length > 0 && cancelledUploads.length > 0 && (
          <Separator className="my-0" />
        )}

        <UploadList
          title="Cancelled"
          icon={Ban}
          items={cancelledUploads}
          onAction={removeUpload}
          actionIcon={X}
          variant="muted"
        />
      </div>
    </div>
  );
}
