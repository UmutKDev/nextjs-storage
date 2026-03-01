"use client";

import React from "react";
import { cloudArchiveApiFactory } from "@/Service/Factories";
import { useQueryClient } from "@tanstack/react-query";
import {
  CLOUD_DIRECTORIES_QUERY_KEY,
  CLOUD_OBJECTS_QUERY_KEY,
} from "@/hooks/useCloudList";
import type { CloudObjectModel } from "@/Service/Generates/api";
import { useExplorerEncryption } from "../contexts/ExplorerEncryptionContext";
import { getParentPath, normalizeStoragePath } from "../utils/path";
import type { ArchiveExtractJob } from "../types/explorer.types";
import { getFileDisplayName } from "../utils/item";
import { useNotificationContext } from "@/features/notifications/context/NotificationProvider";
import { NotificationType } from "@/features/notifications/types/notification.types";

const EXTRACT_JOB_CLEANUP_DELAY_MS = 10000;

export function useExplorerArchiveExtract() {
  const queryClient = useQueryClient();
  const { getSessionToken } = useExplorerEncryption();
  const { subscribe } = useNotificationContext();
  const [extractJobs, setExtractJobs] = React.useState<
    Record<string, ArchiveExtractJob>
  >({});
  const jobIdToKeyRef = React.useRef(new Map<string, string>());

  const invalidatePath = React.useCallback(
    async (path: string) => {
      const normalized = normalizeStoragePath(path);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: CLOUD_OBJECTS_QUERY_KEY,
          predicate: (query) =>
            Array.isArray(query.queryKey) &&
            query.queryKey[0] === CLOUD_OBJECTS_QUERY_KEY[0] &&
            query.queryKey[1] === CLOUD_OBJECTS_QUERY_KEY[1] &&
            query.queryKey[2] === normalized,
        }),
        queryClient.invalidateQueries({
          queryKey: CLOUD_DIRECTORIES_QUERY_KEY,
          predicate: (query) =>
            Array.isArray(query.queryKey) &&
            query.queryKey[0] === CLOUD_DIRECTORIES_QUERY_KEY[0] &&
            query.queryKey[1] === CLOUD_DIRECTORIES_QUERY_KEY[1] &&
            query.queryKey[2] === normalized,
        }),
      ]);
    },
    [queryClient],
  );

  const scheduleJobCleanup = React.useCallback((key: string) => {
    setTimeout(() => {
      setExtractJobs((previous) => {
        if (!previous[key]) return previous;
        const nextJobs = { ...previous };
        delete nextJobs[key];
        return nextJobs;
      });
    }, EXTRACT_JOB_CLEANUP_DELAY_MS);
  }, []);

  const updateExtractJob = React.useCallback(
    (
      key: string,
      update: Partial<ArchiveExtractJob> & {
        progress?: ArchiveExtractJob["progress"];
      },
    ) => {
      setExtractJobs((previous) => {
        const existing = previous[key];
        if (!existing) {
          return {
            ...previous,
            [key]: {
              key,
              state: update.state ?? "waiting",
              jobId: update.jobId,
              format: update.format,
              progress: update.progress,
              extractedPath: update.extractedPath,
              failedReason: update.failedReason,
              updatedAt: Date.now(),
            },
          };
        }
        return {
          ...previous,
          [key]: {
            ...existing,
            ...update,
            updatedAt: Date.now(),
          },
        };
      });
    },
    [],
  );

  React.useEffect(() => {
    const unsubscribe = subscribe((payload) => {
      const rawJobId = payload.Data?.JobId;
      if (!rawJobId) return;
      const jobId = String(rawJobId);

      const key = jobIdToKeyRef.current.get(jobId);
      if (!key) return;

      switch (payload.Type) {
        case NotificationType.ARCHIVE_EXTRACT_PROGRESS: {
          const data = payload.Data as Record<string, unknown>;
          updateExtractJob(key, {
            state: "active",
            progress: {
              phase: data.Phase as "extract" | "create" | undefined,
              entriesProcessed: data.EntriesProcessed as number | undefined,
              totalEntries: data.TotalEntries as number | null | undefined,
              bytesRead: data.BytesRead as number | undefined,
              totalBytes: data.TotalBytes as number | null | undefined,
              currentEntry: data.CurrentEntry as string | undefined,
            },
          });
          break;
        }

        case NotificationType.ARCHIVE_EXTRACT_COMPLETE: {
          const data = payload.Data as Record<string, unknown>;
          const extractedPath = data.ExtractedPath as string | undefined;
          updateExtractJob(key, {
            state: "completed",
            extractedPath,
          });
          const parentPath = getParentPath(key);
          if (extractedPath) {
            void Promise.all([
              invalidatePath(parentPath),
              invalidatePath(extractedPath),
            ]);
          } else {
            void invalidatePath(parentPath);
          }
          scheduleJobCleanup(key);
          jobIdToKeyRef.current.delete(jobId);
          break;
        }

        case NotificationType.ARCHIVE_EXTRACT_FAILED: {
          updateExtractJob(key, { state: "failed" });
          scheduleJobCleanup(key);
          jobIdToKeyRef.current.delete(jobId);
          break;
        }
      }
    });

    return unsubscribe;
  }, [subscribe, updateExtractJob, invalidatePath, scheduleJobCleanup]);

  const createArchiveExtractionJob = React.useCallback(
    async (
      file: CloudObjectModel,
      selectedEntries?: string[],
      totalEntries?: number,
    ) => {
      const key = file.Path?.Key;
      if (!key) {
        return;
      }

      updateExtractJob(key, {
        state: "starting",
        progress: totalEntries ? { totalEntries } : undefined,
      });

      try {
        const sessionToken = getSessionToken(key);
        const response = await cloudArchiveApiFactory.archiveExtractStart({
          cloudArchiveExtractStartRequestModel: {
            Key: key,
            SelectedEntries: selectedEntries,
          },
          xFolderSession: sessionToken ?? undefined,
        });
        const result = response.data?.Result;
        const jobId = result?.JobId;
        if (!jobId) {
          updateExtractJob(key, { state: "failed" });
          scheduleJobCleanup(key);
          return;
        }

        jobIdToKeyRef.current.set(String(jobId), key);

        updateExtractJob(key, {
          jobId,
          state: "waiting",
          format: result.Format,
        });
      } catch (error) {
        console.error(error);
        updateExtractJob(key, { state: "failed" });
        scheduleJobCleanup(key);
      }
    },
    [getSessionToken, scheduleJobCleanup, updateExtractJob],
  );

  const cancelArchiveExtractionJob = React.useCallback(
    async (file: CloudObjectModel) => {
      const key = file.Path?.Key;
      if (!key) return;
      const job = extractJobs[key];
      if (!job?.jobId) return;

      try {
        await cloudArchiveApiFactory.archiveExtractCancel({
          cloudArchiveExtractCancelRequestModel: { JobId: job.jobId },
        });
        jobIdToKeyRef.current.delete(String(job.jobId));
        updateExtractJob(key, { state: "cancelled" });
        scheduleJobCleanup(key);
      } catch (error) {
        console.error(error);
      }
    },
    [extractJobs, scheduleJobCleanup, updateExtractJob],
  );

  return {
    extractJobs,
    createArchiveExtractionJob,
    cancelArchiveExtractionJob,
    getFileDisplayName,
  };
}
