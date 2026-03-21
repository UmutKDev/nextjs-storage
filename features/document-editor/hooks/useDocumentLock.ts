"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cloudDocumentsApiFactory } from "@/Service/Factories";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import type { DocumentLockResponseModel } from "@/types/document.types";
import { DocumentLockStatus } from "@/types/document.types";

const HEARTBEAT_INTERVAL_MS = 180_000; // 3 minutes

export function useDocumentLock(fileKey: string) {
  const [lockStatus, setLockStatus] = useState<string>(
    DocumentLockStatus.Unlocked,
  );
  const [lockInfo, setLockInfo] = useState<DocumentLockResponseModel | null>(
    null,
  );
  const [isLocking, setIsLocking] = useState(false);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileKeyRef = useRef(fileKey);
  fileKeyRef.current = fileKey;

  const clearHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const acquireLock = useCallback(async () => {
    setIsLocking(true);
    try {
      const res = await cloudDocumentsApiFactory.acquireLock({
        documentKeyRequestModel: { Key: fileKey },
      });
      const result = res.data?.Result as DocumentLockResponseModel;
      setLockStatus(result?.LockStatus ?? DocumentLockStatus.LockedByMe);
      setLockInfo(result ?? null);
      toast.success("Document locked for editing");

      // Start heartbeat
      clearHeartbeat();
      heartbeatRef.current = setInterval(async () => {
        try {
          await cloudDocumentsApiFactory.extendLock({
            documentKeyRequestModel: { Key: fileKeyRef.current },
          });
        } catch {
          clearHeartbeat();
          setLockStatus(DocumentLockStatus.Unlocked);
          setLockInfo(null);
          toast.warning("Lock expired. Another user may edit.");
        }
      }, HEARTBEAT_INTERVAL_MS);

      return true;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 423) {
        toast.error("Document is locked by another user");
        setLockStatus(DocumentLockStatus.LockedByOther);
      } else {
        toast.error("Failed to acquire lock");
      }
      return false;
    } finally {
      setIsLocking(false);
    }
  }, [fileKey, clearHeartbeat]);

  const releaseLock = useCallback(async () => {
    clearHeartbeat();
    try {
      await cloudDocumentsApiFactory.releaseLock({
        documentKeyRequestModel: { Key: fileKey },
      });
      setLockStatus(DocumentLockStatus.Unlocked);
      setLockInfo(null);
    } catch {
      // Best effort
    }
  }, [fileKey, clearHeartbeat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearHeartbeat();
      // Best-effort unlock on unmount
      cloudDocumentsApiFactory
        .releaseLock({
          documentKeyRequestModel: { Key: fileKeyRef.current },
        })
        .catch(() => {});
    };
  }, [clearHeartbeat]);

  return {
    lockStatus,
    lockInfo,
    acquireLock,
    releaseLock,
    isLocking,
    setLockStatus,
    setLockInfo,
  };
}
