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

const CREATE_POLL_INTERVAL_MS = 1500;
const CREATE_JOB_CLEANUP_DELAY_MS = 10000;

export function useExplorerArchiveCreate() {
  const queryClient = useQueryClient();
  const [createJobs, setCreateJobs] = React.useState<
    Record<string, ArchiveCreateJob>
  >({});
  const createToastStateRef = React.useRef<Record<string, string>>({});

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

  const scheduleJobCleanup = React.useCallback((jobKey: string) => {
    setTimeout(() => {
      setCreateJobs((previous) => {
        if (!previous[jobKey]) return previous;
        const nextJobs = { ...previous };
        delete nextJobs[jobKey];
        return nextJobs;
      });
      delete createToastStateRef.current[jobKey];
    }, CREATE_JOB_CLEANUP_DELAY_MS);
  }, []);

  const updateCreateJob = React.useCallback(
    (jobKey: string, update: Partial<ArchiveCreateJob>) => {
      setCreateJobs((previous) => {
        const existing = previous[jobKey];
        if (!existing) {
          return {
            ...previous,
            [jobKey]: {
              state: update.state ?? "waiting",
              jobId: update.jobId,
              format: update.format,
              outputKey: update.outputKey,
              progress: update.progress,
              archiveKey: update.archiveKey,
              archiveSize: update.archiveSize,
              failedReason: update.failedReason,
              updatedAt: Date.now(),
            },
          };
        }
        return {
          ...previous,
          [jobKey]: {
            ...existing,
            ...update,
            updatedAt: Date.now(),
          },
        };
      });
    },
    [],
  );

  const fetchCreateStatus = React.useCallback(
    async (jobKey: string, jobId: string) => {
      try {
        const response = await cloudArchiveApiFactory.archiveCreateStatus({
          jobId,
        });
        const result = response.data?.Result;
        if (!result) return;

        const raw = (result.Progress || {}) as Record<string, unknown>;
        const progress: ArchiveCreateJob["progress"] = {
          entriesProcessed: (raw.EntriesProcessed ?? raw.entriesProcessed) as number | undefined,
          totalEntries: (raw.TotalEntries ?? raw.totalEntries) as number | null | undefined,
          bytesProcessed: (raw.BytesProcessed ?? raw.bytesProcessed) as number | undefined,
          totalBytes: (raw.TotalBytes ?? raw.totalBytes) as number | null | undefined,
        };

        updateCreateJob(jobKey, {
          state: result.State,
          progress,
          archiveKey: result.ArchiveKey,
          archiveSize: result.ArchiveSize,
          failedReason: result.FailedReason,
        });

        if (
          result.State === "completed" &&
          createToastStateRef.current[jobKey] !== "completed"
        ) {
          const archiveKey = result.ArchiveKey;
          if (archiveKey) {
            const parentPath = getParentPath(archiveKey);
            await invalidatePath(parentPath);
          }
          scheduleJobCleanup(jobKey);
          createToastStateRef.current[jobKey] = "completed";
        }

        if (
          result.State === "failed" &&
          createToastStateRef.current[jobKey] !== "failed"
        ) {
          scheduleJobCleanup(jobKey);
          createToastStateRef.current[jobKey] = "failed";
        }
      } catch (error) {
        console.error(error);
      }
    },
    [invalidatePath, scheduleJobCleanup, updateCreateJob],
  );

  React.useEffect(() => {
    const pollStates = new Set(["active", "waiting", "delayed", "starting"]);
    const jobsToPoll = Object.entries(createJobs).filter(
      ([, job]) => job.jobId && pollStates.has(job.state),
    );

    if (jobsToPoll.length === 0) return;

    jobsToPoll.forEach(([jobKey, job]) => {
      if (job.jobId) void fetchCreateStatus(jobKey, job.jobId);
    });

    const intervalId = setInterval(() => {
      jobsToPoll.forEach(([jobKey, job]) => {
        if (job.jobId) void fetchCreateStatus(jobKey, job.jobId);
      });
    }, CREATE_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [createJobs, fetchCreateStatus]);

  const startArchiveCreation = React.useCallback(
    async (
      keys: string[],
      format?: CloudArchiveCreateStartRequestModelFormatEnum,
      outputName?: string,
    ) => {
      const jobKey = keys.join(",");

      delete createToastStateRef.current[jobKey];
      updateCreateJob(jobKey, { state: "starting", format });

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
          updateCreateJob(jobKey, { state: "failed" });
          scheduleJobCleanup(jobKey);
          createToastStateRef.current[jobKey] = "failed";
          return;
        }
        updateCreateJob(jobKey, {
          jobId,
          state: "waiting",
          format: result.Format,
          outputKey: result.OutputKey,
        });
        await fetchCreateStatus(jobKey, jobId);
      } catch (error) {
        console.error(error);
        updateCreateJob(jobKey, { state: "failed" });
        scheduleJobCleanup(jobKey);
        createToastStateRef.current[jobKey] = "failed";
      }
    },
    [fetchCreateStatus, scheduleJobCleanup, updateCreateJob],
  );

  const cancelArchiveCreation = React.useCallback(
    async (jobKey: string) => {
      const job = createJobs[jobKey];
      if (!job?.jobId) return;

      try {
        await cloudArchiveApiFactory.archiveCreateCancel({
          cloudArchiveCreateCancelRequestModel: { JobId: job.jobId },
        });
        updateCreateJob(jobKey, { state: "cancelled" });
        scheduleJobCleanup(jobKey);
        createToastStateRef.current[jobKey] = "cancelled";
      } catch (error) {
        console.error(error);
      }
    },
    [createJobs, scheduleJobCleanup, updateCreateJob],
  );

  return {
    createJobs,
    startArchiveCreation,
    cancelArchiveCreation,
  };
}
