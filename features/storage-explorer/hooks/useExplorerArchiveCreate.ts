"use client";

import React from "react";
import { cloudArchiveApiFactory } from "@/Service/Factories";
import { useQueryClient } from "@tanstack/react-query";
import {
  CLOUD_DIRECTORIES_QUERY_KEY,
  CLOUD_OBJECTS_QUERY_KEY,
} from "@/hooks/useCloudList";
import { normalizeStoragePath, getParentPath } from "../utils/path";
import type { ArchiveCreateJob } from "../types/explorer.types";
import type { CloudArchiveCreateStartRequestModelFormatEnum } from "@/Service/Generates/api";
import { useNotificationContext } from "@/features/notifications/context/NotificationProvider";
import { NotificationType } from "@/features/notifications/types/notification.types";

const CREATE_JOB_CLEANUP_DELAY_MS = 10000;

export function useExplorerArchiveCreate() {
  const queryClient = useQueryClient();
  const { subscribe } = useNotificationContext();
  const [createJobs, setCreateJobs] = React.useState<
    Record<string, ArchiveCreateJob>
  >({});
  const jobIdToKeysRef = React.useRef(new Map<string, string[]>());

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

  const scheduleJobsCleanup = React.useCallback((keys: string[]) => {
    setTimeout(() => {
      setCreateJobs((previous) => {
        const nextJobs = { ...previous };
        let changed = false;
        for (const key of keys) {
          if (nextJobs[key]) {
            delete nextJobs[key];
            changed = true;
          }
        }
        return changed ? nextJobs : previous;
      });
    }, CREATE_JOB_CLEANUP_DELAY_MS);
  }, []);

  const updateCreateJobs = React.useCallback(
    (keys: string[], update: Partial<ArchiveCreateJob>) => {
      setCreateJobs((previous) => {
        const nextJobs = { ...previous };
        for (const key of keys) {
          const existing = nextJobs[key];
          if (!existing) {
            nextJobs[key] = {
              state: update.state ?? "waiting",
              jobId: update.jobId,
              format: update.format,
              outputKey: update.outputKey,
              progress: update.progress,
              archiveKey: update.archiveKey,
              archiveSize: update.archiveSize,
              failedReason: update.failedReason,
              updatedAt: Date.now(),
            };
          } else {
            nextJobs[key] = {
              ...existing,
              ...update,
              updatedAt: Date.now(),
            };
          }
        }
        return nextJobs;
      });
    },
    [],
  );

  React.useEffect(() => {
    const unsubscribe = subscribe((payload) => {
      const rawJobId = payload.Data?.JobId;
      if (!rawJobId) return;
      const jobId = String(rawJobId);

      const keys = jobIdToKeysRef.current.get(jobId);
      if (!keys) return;

      switch (payload.Type) {
        case NotificationType.ARCHIVE_CREATE_PROGRESS: {
          const data = payload.Data as Record<string, unknown>;
          updateCreateJobs(keys, {
            state: "active",
            progress: {
              entriesProcessed: data.EntriesProcessed as number | undefined,
              totalEntries: data.TotalEntries as number | null | undefined,
              bytesProcessed: data.BytesWritten as number | undefined,
            },
          });
          break;
        }

        case NotificationType.ARCHIVE_CREATE_COMPLETE: {
          const data = payload.Data as Record<string, unknown>;
          const archiveKey = data.Key as string | undefined;
          updateCreateJobs(keys, {
            state: "completed",
            archiveKey,
            archiveSize: data.Size as number | undefined,
          });
          if (archiveKey) {
            const parentPath = getParentPath(archiveKey);
            void invalidatePath(parentPath);
          }
          scheduleJobsCleanup(keys);
          jobIdToKeysRef.current.delete(jobId);
          break;
        }

        case NotificationType.ARCHIVE_CREATE_FAILED: {
          updateCreateJobs(keys, { state: "failed" });
          scheduleJobsCleanup(keys);
          jobIdToKeysRef.current.delete(jobId);
          break;
        }
      }
    });

    return unsubscribe;
  }, [subscribe, updateCreateJobs, invalidatePath, scheduleJobsCleanup]);

  const startArchiveCreation = React.useCallback(
    async (
      keys: string[],
      format?: CloudArchiveCreateStartRequestModelFormatEnum,
      outputName?: string,
    ) => {
      updateCreateJobs(keys, { state: "starting", format });

      try {
        const response = await cloudArchiveApiFactory.archiveCreateStart({
          cloudArchiveCreateStartRequestModel: {
            Keys: keys,
            Format: format,
            OutputName: outputName,
          },
        });
        const result = response.data?.Result;
        const jobId = result?.JobId;
        if (!jobId) {
          updateCreateJobs(keys, { state: "failed" });
          scheduleJobsCleanup(keys);
          return;
        }

        jobIdToKeysRef.current.set(String(jobId), keys);

        updateCreateJobs(keys, {
          jobId,
          state: "waiting",
          format: result.Format,
          outputKey: result.OutputKey,
        });
      } catch (error) {
        console.error(error);
        updateCreateJobs(keys, { state: "failed" });
        scheduleJobsCleanup(keys);
      }
    },
    [scheduleJobsCleanup, updateCreateJobs],
  );

  const cancelArchiveCreation = React.useCallback(
    async (jobKey: string) => {
      const job = createJobs[jobKey];
      if (!job?.jobId) return;

      try {
        await cloudArchiveApiFactory.archiveCreateCancel({
          cloudArchiveCreateCancelRequestModel: { JobId: job.jobId },
        });
        const allKeys = jobIdToKeysRef.current.get(String(job.jobId)) ?? [
          jobKey,
        ];
        jobIdToKeysRef.current.delete(String(job.jobId));
        updateCreateJobs(allKeys, { state: "cancelled" });
        scheduleJobsCleanup(allKeys);
      } catch (error) {
        console.error(error);
      }
    },
    [createJobs, scheduleJobsCleanup, updateCreateJobs],
  );

  return {
    createJobs,
    startArchiveCreation,
    cancelArchiveCreation,
  };
}
