"use client";

import React from "react";
import { cloudApiFactory } from "@/Service/Factories";
import { useQueryClient } from "@tanstack/react-query";
import {
  CLOUD_DIRECTORIES_QUERY_KEY,
  CLOUD_OBJECTS_QUERY_KEY,
} from "@/hooks/useCloudList";
import type { CloudObjectModel } from "@/Service/Generates/api";
import { useExplorerEncryption } from "../contexts/ExplorerEncryptionContext";
import { getParentPath, normalizeStoragePath } from "../utils/path";
import type { ExplorerExtractJob } from "../types/explorer.types";
import { getFileDisplayName } from "../utils/item";

const EXTRACT_POLL_INTERVAL_MS = 1500;
const EXTRACT_JOB_CLEANUP_DELAY_MS = 10000;

export function useExplorerExtractZip() {
  const queryClient = useQueryClient();
  const { getSessionToken } = useExplorerEncryption();
  const [extractJobs, setExtractJobs] = React.useState<
    Record<string, ExplorerExtractJob>
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
      update: Partial<ExplorerExtractJob> & {
        progress?: ExplorerExtractJob["progress"];
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

  const fetchZipExtractionStatus = React.useCallback(
    async (key: string, jobId: string) => {
      try {
        const response = await cloudApiFactory.extractZipStatus({ jobId });
        const result = response.data?.Result;
        if (!result) return;

        const progress = (result.Progress ||
          {}) as ExplorerExtractJob["progress"];

        updateExtractJob(key, {
          state: result.State,
          progress,
          extractedPath: result.ExtractedPath,
          failedReason: result.FailedReason,
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

        if (
          result.State === "cancelled" &&
          extractToastStateRef.current[key] !== "cancelled"
        ) {
          scheduleJobCleanup(key);
          extractToastStateRef.current[key] = "cancelled";
        }
      } catch (error) {
        console.error(error);
      }
    },
    [invalidatePath, scheduleJobCleanup, updateExtractJob],
  );

  React.useEffect(() => {
    const pollStates = new Set(["active", "waiting", "delayed", "starting"]);
    const jobsToPoll = Object.values(extractJobs).filter(
      (job) => job.jobId && pollStates.has(job.state),
    );

    if (jobsToPoll.length === 0) return;

    jobsToPoll.forEach((job) => {
      if (job.jobId) void fetchZipExtractionStatus(job.key, job.jobId);
    });

    const intervalId = setInterval(() => {
      jobsToPoll.forEach((job) => {
        if (job.jobId) void fetchZipExtractionStatus(job.key, job.jobId);
      });
    }, EXTRACT_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [extractJobs, fetchZipExtractionStatus]);

  const createZipExtractionJob = React.useCallback(
    async (file: CloudObjectModel) => {
      const key = file.Path?.Key;
      if (!key) {
        return;
      }

      delete extractToastStateRef.current[key];
      updateExtractJob(key, { state: "starting" });

      try {
        const sessionToken = getSessionToken(key);
        const sessionOptions = sessionToken
          ? { headers: { "x-folder-session": sessionToken } }
          : undefined;
        const response = await cloudApiFactory.extractZipStart(
          {
            cloudExtractZipStartRequestModel: { Key: key },
          },
          sessionOptions,
        );
        const jobId = response.data?.Result?.JobId;
        if (!jobId) {
          updateExtractJob(key, { state: "failed" });
          scheduleJobCleanup(key);
          extractToastStateRef.current[key] = "failed";
          return;
        }
        updateExtractJob(key, { jobId, state: "waiting" });
        await fetchZipExtractionStatus(key, jobId);
      } catch (error) {
        console.error(error);
        updateExtractJob(key, { state: "failed" });
        scheduleJobCleanup(key);
        extractToastStateRef.current[key] = "failed";
      }
    },
    [
      fetchZipExtractionStatus,
      getSessionToken,
      scheduleJobCleanup,
      updateExtractJob,
    ],
  );

  const deleteZipExtractionJob = React.useCallback(
    async (file: CloudObjectModel) => {
      const key = file.Path?.Key;
      if (!key) return;
      const job = extractJobs[key];
      if (!job?.jobId) return;

      try {
        await cloudApiFactory.extractZipCancel({
          cloudExtractZipCancelRequestModel: { JobId: job.jobId },
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
    createZipExtractionJob,
    deleteZipExtractionJob,
    getFileDisplayName,
  };
}
