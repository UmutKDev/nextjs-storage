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

const EXTRACT_POLL_INTERVAL_MS = 1500;
const EXTRACT_JOB_CLEANUP_DELAY_MS = 10000;

export function useExplorerArchiveExtract() {
  const queryClient = useQueryClient();
  const { getSessionToken } = useExplorerEncryption();
  const [extractJobs, setExtractJobs] = React.useState<
    Record<string, ArchiveExtractJob>
  >({});
  const extractToastStateRef = React.useRef<Record<string, string>>({});

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
      delete extractToastStateRef.current[key];
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

  const fetchArchiveExtractionStatus = React.useCallback(
    async (key: string, jobId: string) => {
      try {
        const response = await cloudArchiveApiFactory.archiveExtractStatus({
          jobId,
        });
        const result = response.data?.Result;
        if (!result) return;

        setExtractJobs((previous) => {
          const existing = previous[key];
          const storedTotalEntries = existing?.progress?.totalEntries;

          const progress: ArchiveExtractJob["progress"] = result.Progress
            ? {
                phase: result.Progress.Phase,
                entriesProcessed: result.Progress.EntriesProcessed,
                totalEntries:
                  result.Progress.TotalEntries ?? storedTotalEntries ?? null,
                bytesRead: result.Progress.BytesRead,
                totalBytes: result.Progress.TotalBytes,
                currentEntry: result.Progress.CurrentEntry,
              }
            : existing?.progress;

          const updated: ArchiveExtractJob = existing
            ? {
                ...existing,
                state: result.State,
                format: result.Format,
                progress,
                extractedPath: result.ExtractedPath,
                failedReason: result.FailedReason,
                updatedAt: Date.now(),
              }
            : {
                key,
                state: result.State,
                format: result.Format,
                progress,
                extractedPath: result.ExtractedPath,
                failedReason: result.FailedReason,
                updatedAt: Date.now(),
              };

          return { ...previous, [key]: updated };
        });

        if (
          result.State === "completed" &&
          extractToastStateRef.current[key] !== "completed"
        ) {
          const extractedPath = result.ExtractedPath;
          const parentPath = getParentPath(key);
          if (extractedPath) {
            await Promise.all([
              invalidatePath(parentPath),
              invalidatePath(extractedPath),
            ]);
          } else {
            await invalidatePath(parentPath);
          }
          scheduleJobCleanup(key);
          extractToastStateRef.current[key] = "completed";
        }

        if (
          result.State === "failed" &&
          extractToastStateRef.current[key] !== "failed"
        ) {
          scheduleJobCleanup(key);
          extractToastStateRef.current[key] = "failed";
        }
      } catch (error) {
        console.error(error);
      }
    },
    [invalidatePath, scheduleJobCleanup],
  );

  React.useEffect(() => {
    const pollStates = new Set(["active", "waiting", "delayed", "starting"]);
    const jobsToPoll = Object.values(extractJobs).filter(
      (job) => job.jobId && pollStates.has(job.state),
    );

    if (jobsToPoll.length === 0) return;

    jobsToPoll.forEach((job) => {
      if (job.jobId) void fetchArchiveExtractionStatus(job.key, job.jobId);
    });

    const intervalId = setInterval(() => {
      jobsToPoll.forEach((job) => {
        if (job.jobId) void fetchArchiveExtractionStatus(job.key, job.jobId);
      });
    }, EXTRACT_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [extractJobs, fetchArchiveExtractionStatus]);

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

      delete extractToastStateRef.current[key];
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
          extractToastStateRef.current[key] = "failed";
          return;
        }
        updateExtractJob(key, {
          jobId,
          state: "waiting",
          format: result.Format,
        });
        await fetchArchiveExtractionStatus(key, jobId);
      } catch (error) {
        console.error(error);
        updateExtractJob(key, { state: "failed" });
        scheduleJobCleanup(key);
        extractToastStateRef.current[key] = "failed";
      }
    },
    [
      fetchArchiveExtractionStatus,
      getSessionToken,
      scheduleJobCleanup,
      updateExtractJob,
    ],
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
        updateExtractJob(key, { state: "cancelled" });
        scheduleJobCleanup(key);
        extractToastStateRef.current[key] = "cancelled";
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
