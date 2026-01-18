import { useState, useRef, useCallback } from "react";
import { cloudApiFactory } from "@/Service/Factories";
import toast from "react-hot-toast";
import type { AxiosProgressEvent } from "axios";
import { isAxiosError } from "axios";
import useCloudList from "./useCloudList";
import useUserStorageUsage from "./useUserStorageUsage";
import { useEncryptedFolders } from "@/components/Storage/EncryptedFoldersProvider";
import { useStorage } from "@/components/Storage/StorageProvider";
import { md5Base64 } from "@/lib/md5";
import { retryWithBackoff } from "@/lib/retry";
import { createIdempotencyKey } from "@/lib/idempotency";

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
  const { isCurrentLocked } = useStorage();
  // We only need invalidation helpers here — don't run the list queries when
  // the upload modal/component mounts to avoid unnecessary network requests.
  const { invalidates } = useCloudList(currentPath || "", { enabled: false });
  const { invalidate: invalidatesUsage } = useUserStorageUsage(); // to ensure usage is up to date after upload
  const { getSessionToken, isFolderEncrypted, isFolderUnlocked } =
    useEncryptedFolders();
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const controllersRef = useRef<Record<string, AbortController>>({});
  // query client is not required here; invalidation helpers from useCloudList
  // and useUserStorageUsage are used instead, so remove unused qc.

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
      if (
        isCurrentLocked ||
        (isFolderEncrypted(currentPath) && !isFolderUnlocked(currentPath))
      ) {
        toast.error("Sifrelenmis klasor kilitli. Dosya yukleme devre disi.");
        return;
      }
      const sessionToken = getSessionToken(currentPath || "");
      const headers = sessionToken
        ? { "X-Folder-Session": sessionToken }
        : undefined;
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
        const createResp = await retryWithBackoff(
          () =>
            cloudApiFactory.uploadCreateMultipartUpload(
              {
                cloudCreateMultipartUploadRequestModel: {
                  Key: key,
                  ContentType: file.type || undefined,
                  TotalSize: file.size,
                  Metadata: {
                    originalFileName: file.name,
                  },
                },
                xFolderSession: sessionToken || undefined,
              },
              { headers }
            ),
          {
            shouldRetry: (err) =>
              isAxiosError(err) && err.response?.status === 429,
          }
        );

        uploadId = createResp.data?.result?.UploadId;
        finalKey = createResp.data?.result?.Key ?? key;

        if (!uploadId) throw new Error("Missing uploadId");
        if (!finalKey) throw new Error("Missing upload key");
        const ensuredUploadId = uploadId;
        const ensuredKey = finalKey;

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

          const contentMd5 = await md5Base64(chunk);

          const partResp = await retryWithBackoff(
            () =>
              cloudApiFactory.uploadPart(
                {
                  contentMd5,
                  key: ensuredKey,
                  uploadId: ensuredUploadId,
                  partNumber,
                  file: chunkFile,
                  xFolderSession: sessionToken || undefined,
                },
                {
                  headers,
                  signal: controller.signal,
                  onUploadProgress: (e: AxiosProgressEvent) => {
                    const loaded = e.loaded ?? 0;
                    const overallLoaded = uploadedBytesSoFar + loaded;
                    const p = Math.round((overallLoaded / totalSize) * 100);
                    updateUpload(id, { progress: Math.min(100, p) });
                  },
                }
              ),
            {
              shouldRetry: (err) =>
                isAxiosError(err) && err.response?.status === 429,
              signal: controller.signal,
            }
          );

          const etag = partResp.data?.result?.ETag;
          if (!etag) throw new Error(`Missing ETag for part ${partNumber}`);
          parts.push({ PartNumber: partNumber, ETag: etag });
          uploadedBytesSoFar += chunk.size;
        }

        // 3. Complete Multipart Upload
        const idempotencyKey = createIdempotencyKey();
        await retryWithBackoff(
          () =>
            cloudApiFactory.uploadCompleteMultipartUpload(
              {
                idempotencyKey,
                cloudCompleteMultipartUploadRequestModel: {
                  Key: ensuredKey,
                  UploadId: ensuredUploadId,
                  Parts: parts,
                },
                xFolderSession: sessionToken || undefined,
              },
              { headers }
            ),
          {
            shouldRetry: (err) =>
              isAxiosError(err) && err.response?.status === 429,
          }
        );

        updateUpload(id, { progress: 100, status: "completed" });

        // Invalidate queries
        await Promise.all([
          invalidates.invalidateObjects(),
          invalidatesUsage(),
        ]);

        toast.success(`Uploaded ${file.name}`);
      } catch (err: unknown) {
        // Cleanup on server if possible
        if (uploadId && finalKey) {
          try {
            await retryWithBackoff(
              () =>
                cloudApiFactory.uploadAbortMultipartUpload(
                  {
                    cloudAbortMultipartUploadRequestModel: {
                      Key: finalKey!,
                      UploadId: uploadId!,
                    },
                  },
                  { headers }
                ),
              {
                shouldRetry: (err) =>
                  isAxiosError(err) && err.response?.status === 429,
              }
            );
          } catch (e) {
            console.warn("Abort failed", e);
          }
        }

        const isCancelledError =
          err === "cancelled" ||
          (err instanceof Error && err.message === "cancelled") ||
          controller.signal.aborted;

        if (isCancelledError) {
          updateUpload(id, { status: "cancelled" });
        } else {
          console.error("Upload error", err);
          const msg = err instanceof Error ? err.message : String(err);
          updateUpload(id, {
            status: "failed",
            error: msg,
          });
          toast.error(`Failed ${file.name}`);
        }
      } finally {
        delete controllersRef.current[id];
      }
    },
    [
      currentPath,
      updateUpload,
      invalidates,
      invalidatesUsage,
      getSessionToken,
      isFolderEncrypted,
      isFolderUnlocked,
      isCurrentLocked,
    ]
  );

  const handleFiles = useCallback(
    (files: File[]) => {
      if (
        isCurrentLocked ||
        (isFolderEncrypted(currentPath) && !isFolderUnlocked(currentPath))
      ) {
        toast.error("Sifrelenmis klasor kilitli. Dosya yukleme devre disi.");
        return;
      }
      files.forEach(uploadFile);
    },
    [
      uploadFile,
      currentPath,
      isFolderEncrypted,
      isFolderUnlocked,
      isCurrentLocked,
    ]
  );

  return {
    uploads,
    handleFiles,
    cancelUpload,
    removeUpload,
  };
}
