"use client";

import type React from "react";
import { useRef } from "react";
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

  const openFilePicker = () => {
    filePickerRef.current?.click();
  };

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) handleFiles(Array.from(selectedFiles));
    // Reset input so same file can be selected again if needed
    if (filePickerRef.current) filePickerRef.current.value = "";
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const onDropFiles = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles) handleFiles(Array.from(droppedFiles));
  };

  const activeUploads = uploads.filter((f) => f.status === "uploading");
  const completedUploads = uploads.filter((f) => f.status === "completed");
  const failedUploads = uploads.filter((f) => f.status === "failed");
  const cancelledUploads = uploads.filter((f) => f.status === "cancelled");

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-y-6">
      <Card
        className="group flex max-h-[200px] w-full flex-col items-center justify-center gap-4 py-8 border-dashed text-sm cursor-pointer hover:bg-muted/50 transition-colors"
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
          Supported: JPG, PNG, GIF (max 10 MB)
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
