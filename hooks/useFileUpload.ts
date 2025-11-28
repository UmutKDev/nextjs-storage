import { useState, useRef, useCallback } from "react";
import { cloudApiFactory } from "@/Service/Factories";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { AxiosProgressEvent } from "axios";
import useCloudList from "./useCloudList";
import useUserStorageUsage from "./useUserStorageUsage";

export type UploadStatus = "uploading" | "completed" | "failed" | "cancelled";

export interface UploadItem {
  id: string;
  name: string;
  progress: number;
  status: UploadStatus;
  error?: string;
  file?: File;
}

export function useFileUpload(currentPath: string | null) {
  const { invalidates } = useCloudList(currentPath || "");
  const { invalidate: invalidatesUsage } = useUserStorageUsage(); // to ensure usage is up to date after upload
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const controllersRef = useRef<Record<string, AbortController>>({});
  const qc = useQueryClient();

  const updateUpload = useCallback((id: string, patch: Partial<UploadItem>) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...patch } : u))
    );
  }, []);

  const removeUpload = useCallback((id: string) => {
    const ctrl = controllersRef.current[id];
    if (ctrl) {
      ctrl.abort();
      delete controllersRef.current[id];
    }
    setUploads((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const cancelUpload = useCallback(
    (id: string) => {
      const ctrl = controllersRef.current[id];
      if (ctrl) {
        ctrl.abort("cancelled");
        delete controllersRef.current[id];
      }
      updateUpload(id, { status: "cancelled", progress: 0 });
    },
    [updateUpload]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newItem: UploadItem = {
        id,
        name: file.name,
        progress: 0,
        status: "uploading",
        file,
      };
      setUploads((prev) => [newItem, ...prev]);

      const controller = new AbortController();
      controllersRef.current[id] = controller;

      let uploadId: string | undefined;
      let finalKey: string | undefined;

      try {
        const prefix = currentPath
          ? currentPath.endsWith("/")
            ? currentPath
            : `${currentPath}/`
          : "";
        const key = `${prefix}${file.name}`;

        // 1. Create Multipart Upload
        const createResp = await cloudApiFactory.uploadCreateMultipartUpload({
          cloudCreateMultipartUploadRequestModel: {
            Key: key,
            ContentType: file.type || undefined,
            TotalSize: file.size,
            Metadata: {
              originalFileName: file.name,
            },
          },
        });

        uploadId = createResp.data?.result?.UploadId;
        finalKey = createResp.data?.result?.Key ?? key;

        if (!uploadId) throw new Error("Missing uploadId");

        // 2. Upload Parts
        const CHUNK_SIZE = 5 * 1024 * 1024;
        const totalSize = file.size;
        const totalParts = Math.max(1, Math.ceil(totalSize / CHUNK_SIZE));
        const parts: { PartNumber: number; ETag: string }[] = [];
        let uploadedBytesSoFar = 0;

        for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
          if (controller.signal.aborted)
            throw new Error(controller.signal.reason || "cancelled");

          const start = (partNumber - 1) * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, totalSize);
          const chunk = file.slice(start, end);
          const chunkFile = new File([chunk], file.name, {
            type: file.type || "application/octet-stream",
          });

          const partResp = await cloudApiFactory.uploadPart(
            { key: finalKey, uploadId, partNumber, file: chunkFile },
            {
              signal: controller.signal,
              onUploadProgress: (e: AxiosProgressEvent) => {
                const loaded = e.loaded ?? 0;
                const overallLoaded = uploadedBytesSoFar + loaded;
                const p = Math.round((overallLoaded / totalSize) * 100);
                updateUpload(id, { progress: Math.min(100, p) });
              },
            }
          );

          const etag = partResp.data?.result?.ETag;
          if (!etag) throw new Error(`Missing ETag for part ${partNumber}`);
          parts.push({ PartNumber: partNumber, ETag: etag });
          uploadedBytesSoFar += chunk.size;
        }

        // 3. Complete Multipart Upload
        await cloudApiFactory.uploadCompleteMultipartUpload({
          cloudCompleteMultipartUploadRequestModel: {
            Key: finalKey,
            UploadId: uploadId,
            Parts: parts,
          },
        });

        updateUpload(id, { progress: 100, status: "completed" });

        // Invalidate queries
        await Promise.all([
          invalidates.invalidateObjects(),
          invalidatesUsage(),
        ]);

        toast.success(`Uploaded ${file.name}`);
      } catch (err: any) {
        // Cleanup on server if possible
        if (uploadId && finalKey) {
          try {
            await cloudApiFactory.uploadAbortMultipartUpload({
              cloudAbortMultipartUploadRequestModel: {
                Key: finalKey!,
                UploadId: uploadId!,
              },
            });
          } catch (e) {
            console.warn("Abort failed", e);
          }
        }

        if (
          err === "cancelled" ||
          err?.message === "cancelled" ||
          controller.signal.aborted
        ) {
          updateUpload(id, { status: "cancelled" });
        } else {
          console.error("Upload error", err);
          updateUpload(id, {
            status: "failed",
            error: err.message || String(err),
          });
          toast.error(`Failed ${file.name}`);
        }
      } finally {
        delete controllersRef.current[id];
      }
    },
    [currentPath, qc, updateUpload]
  );

  const handleFiles = useCallback(
    (files: File[]) => {
      files.forEach(uploadFile);
    },
    [uploadFile]
  );

  return {
    uploads,
    handleFiles,
    cancelUpload,
    removeUpload,
  };
}
