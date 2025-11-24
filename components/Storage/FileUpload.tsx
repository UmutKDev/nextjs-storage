"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, X, CheckCircle, Loader2 } from "lucide-react";
import { cloudApiFactory } from "@/Service/Factories";
import { useStorage } from "./StorageProvider";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { AxiosProgressEvent } from "axios";

interface UploadItem {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "completed" | "failed";
  error?: string;
}

export default function FileUpload() {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const filePickerRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();
  const { currentPath } = useStorage();
  // AbortControllers map to cancel in-flight uploads when user removes
  const controllersRef = useRef<Record<string, AbortController>>({});

  const openFilePicker = () => {
    filePickerRef.current?.click();
  };

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) handleFiles(Array.from(selectedFiles));
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const onDropFiles = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles) handleFiles(Array.from(droppedFiles));
  };

  const removeUploadById = (id: string) => {
    // abort any in-flight upload
    const ctrl = controllersRef.current[id];
    if (ctrl) {
      try {
        ctrl.abort();
      } catch {}
      delete controllersRef.current[id];
    }
    setUploads((s) => s.filter((file) => file.id !== id));
  };

  function addUpload(item: UploadItem) {
    setUploads((s) => [item, ...s]);
  }

  function updateUpload(id: string, patch: Partial<UploadItem>) {
    setUploads((s) => s.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  async function handleFiles(files: File[]) {
    for (const f of files) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      addUpload({ id, name: f.name, progress: 0, status: "uploading" });

      // start upload flow (single-part overall: create -> uploadPart -> complete)
      const controller = new AbortController();
      controllersRef.current[id] = controller;

      (async () => {
        // keep these in outer scope so we can reference them in error handling (abort cleanup)
        let uploadId: string | undefined;
        let finalKey: string | undefined;
        try {
          const prefix = currentPath
            ? currentPath.endsWith("/")
              ? currentPath
              : `${currentPath}/`
            : "";
          const key = `${prefix}${f.name}`;

          const createResp = await cloudApiFactory.uploadCreateMultipartUpload({
            cloudCreateMultipartUploadRequestModel: {
              Key: key,
              ContentType: f.type || undefined,
            },
          });

          uploadId = createResp.data?.result?.UploadId;
          finalKey = createResp.data?.result?.Key ?? key;

          if (!uploadId) {
            throw new Error("Missing uploadId from create multipart response");
          }

          // Upload in chunks: split file into multiple parts and upload each part.
          // This keeps a running total of bytes uploaded so we can compute overall progress.
          const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per part (adjustable)
          const totalSize = f.size;
          const totalParts = Math.max(1, Math.ceil(totalSize / CHUNK_SIZE));

          const parts: { PartNumber: number; ETag: string }[] = [];
          let uploadedBytesSoFar = 0;

          for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
            // if upload has been aborted externally, stop processing further parts
            if (controller.signal.aborted) throw new Error("canceled");

            const start = (partNumber - 1) * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, totalSize);
            const chunk = f.slice(start, end);

            // create a File for the chunk so the generated API accepts it (form-data File expected)
            const chunkFile = new File([chunk], `${f.name}`, {
              type: f.type || "application/octet-stream",
            });

            const partResp = await cloudApiFactory.uploadPart(
              {
                key: finalKey,
                uploadId,
                partNumber,
                file: chunkFile,
                totalPart: totalParts,
              },
              {
                signal: controller.signal,
                onUploadProgress: (e: AxiosProgressEvent) => {
                  const loaded = (e?.loaded as number | undefined) ?? 0;
                  // loaded is per-chunk; derive overall progress using uploadedBytesSoFar
                  const overallLoaded = uploadedBytesSoFar + loaded;
                  const p = Math.round((overallLoaded / totalSize) * 100);
                  updateUpload(id, { progress: Math.min(100, p) });
                },
              }
            );

            const etag = partResp.data?.result?.ETag;
            if (!etag) {
              throw new Error(`Missing ETag for part ${partNumber}`);
            }
            parts.push({ PartNumber: partNumber, ETag: etag });
            // account for the completed chunk size
            uploadedBytesSoFar += chunk.size;
          }

          // complete upload with all parts
          await cloudApiFactory.uploadCompleteMultipartUpload({
            cloudCompleteMultipartUploadRequestModel: {
              Key: finalKey,
              UploadId: uploadId,
              Parts: parts.map((p) => ({
                PartNumber: p.PartNumber,
                ETag: p.ETag,
              })),
            },
          });

          updateUpload(id, { progress: 100, status: "completed" });

          // invalidate list views so the newly uploaded file appears
          await Promise.all([
            qc.invalidateQueries({ queryKey: ["cloud", "list"] }),
            qc.invalidateQueries({ queryKey: ["cloud-root-folders"] }),
          ]);

          toast.success(`Uploaded ${f.name}`);
        } catch (err: unknown) {
          // If something failed mid-upload, attempt to abort the multipart upload on the server
          try {
            if (uploadId && finalKey) {
              await cloudApiFactory.uploadAbortMultipartUpload({
                cloudAbortMultipartUploadRequestModel: {
                  Key: finalKey,
                  UploadId: uploadId,
                },
              });
            }
          } catch (abortErr) {
            // ignore abort errors — main error takes precedence
            console.warn("Failed to abort multipart upload", abortErr);
          }
          const e = err as { name?: string; message?: string };
          if (e?.name === "CanceledError" || e?.message === "canceled") {
            updateUpload(id, { status: "failed", error: "Canceled" });
            return;
          }
          console.error("upload error", err);
          updateUpload(id, {
            status: "failed",
            error: String(e?.message ?? e),
          });
          toast.error(`Failed uploading ${f.name}: ${String(e)}`);
        } finally {
          delete controllersRef.current[id];
        }
      })();
    }
  }

  const activeUploads = uploads.filter((file) => file.status === "uploading");
  const completedUploads = uploads.filter(
    (file) => file.status === "completed"
  );

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
                onClick={openFilePicker}
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
        {activeUploads.length > 0 && (
          <div>
            <h2 className="text-foreground text-lg flex items-center font-mono font-normal uppercase sm:text-xs mb-4">
              <Loader2 className="size-4 mr-1 animate-spin" />
              Uploading
            </h2>
            <div className="-mt-2 divide-y">
              {activeUploads.map((file) => (
                <div key={file.id} className="group flex items-center py-4">
                  <div className="mr-3 grid size-10 shrink-0 place-content-center rounded border bg-muted">
                    <FileText className="inline size-4 group-hover:hidden" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden size-4 group-hover:inline p-0 h-auto"
                      onClick={() => removeUploadById(file.id)}
                      aria-label="Cancel"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  <div className="flex flex-col w-full mb-1">
                    <div className="flex justify-between gap-2">
                      <span className="select-none text-base/6 text-foreground group-disabled:opacity-50 sm:text-sm/6">
                        {file.name}
                      </span>
                      <span className="text-muted-foreground text-sm tabular-nums">
                        {file.progress}%
                      </span>
                    </div>
                    <Progress
                      value={file.progress}
                      className="mt-1 h-2 min-w-64"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeUploads.length > 0 && completedUploads.length > 0 && (
          <Separator className="my-0" />
        )}

        {completedUploads.length > 0 && (
          <div>
            <h2 className="text-foreground text-lg flex items-center font-mono font-normal uppercase sm:text-xs mb-4">
              <CheckCircle className="mr-1 size-4" />
              Finished
            </h2>
            <div className="-mt-2 divide-y">
              {completedUploads.map((file) => (
                <div key={file.id} className="group flex items-center py-4">
                  <div className="mr-3 grid size-10 shrink-0 place-content-center rounded border bg-muted">
                    <FileText className="inline size-4 group-hover:hidden" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden size-4 group-hover:inline p-0 h-auto"
                      onClick={() => removeUploadById(file.id)}
                      aria-label="Remove"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  <div className="flex flex-col w-full mb-1">
                    <div className="flex justify-between gap-2">
                      <span className="select-none text-base/6 text-foreground group-disabled:opacity-50 sm:text-sm/6">
                        {file.name}
                      </span>
                      <span className="text-muted-foreground text-sm tabular-nums">
                        {file.progress}%
                      </span>
                    </div>
                    <Progress
                      value={file.progress}
                      className="mt-1 h-2 min-w-64"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
