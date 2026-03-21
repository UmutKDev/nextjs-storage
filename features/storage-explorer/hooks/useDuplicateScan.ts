"use client";

import React from "react";
import { cloudApiFactory } from "@/Service/Factories";
import { useNotificationContext } from "@/features/notifications/context/NotificationProvider";
import { NotificationType } from "@/features/notifications/types/notification.types";
import type { DuplicateScanJob } from "../types/explorer.types";

const POLL_INTERVAL_MS = 2000;

export function useDuplicateScan() {
  const { subscribe } = useNotificationContext();
  const [scanJob, setScanJob] = React.useState<DuplicateScanJob | null>(null);
  const pollRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = React.useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const fetchResult = React.useCallback(async (scanId: string) => {
    try {
      const response = await cloudApiFactory.duplicateScanResult({
        scanId,
      });
      const data = response.data?.Result;
      if (data) {
        setScanJob((prev) =>
          prev?.scanId === scanId
            ? {
                ...prev,
                state: "completed",
                result: {
                  totalFilesScanned: data.TotalFilesScanned ?? undefined,
                  totalDuplicateGroups: data.TotalDuplicateGroups ?? undefined,
                  totalPotentialSavingsBytes:
                    data.TotalPotentialSavingsBytes ?? undefined,
                  groups: data.Groups?.map((g) => ({
                    groupId: g.GroupId ?? undefined,
                    matchType: g.MatchType ?? undefined,
                    similarity: g.Similarity ?? undefined,
                    files: g.Files?.map((f) => ({
                      key: f.Key ?? undefined,
                      name: f.Name ?? undefined,
                      size: f.Size ?? undefined,
                      lastModified: f.LastModified ?? undefined,
                      mimeType: f.MimeType ?? undefined,
                      path: f.Path
                        ? {
                            host: f.Path.Host ?? undefined,
                            key: f.Path.Key ?? undefined,
                            url: f.Path.Url ?? undefined,
                          }
                        : undefined,
                    })),
                    potentialSavingsBytes: g.PotentialSavingsBytes ?? undefined,
                  })),
                },
                updatedAt: Date.now(),
              }
            : prev,
        );
      }
    } catch (error) {
      console.error("Failed to fetch duplicate scan result:", error);
    }
  }, []);

  const pollStatus = React.useCallback(
    async (scanId: string) => {
      try {
        const response = await cloudApiFactory.duplicateScanStatus({
          scanId,
        });
        const data = response.data?.Result;
        if (!data) return;

        const status = data.Status as string | undefined;
        const progress = data.Progress;

        setScanJob((prev) => {
          if (!prev || prev.scanId !== scanId) return prev;
          return {
            ...prev,
            state:
              status === "COMPLETED"
                ? "completed"
                : status === "FAILED"
                  ? "failed"
                  : status === "CANCELLED"
                    ? "cancelled"
                    : status === "SCANNING"
                      ? "scanning"
                      : prev.state,
            progress: progress
              ? {
                  totalFiles: progress.TotalFiles ?? undefined,
                  processedFiles: progress.ProcessedFiles ?? undefined,
                  phase: progress.Phase ?? undefined,
                  percentage: progress.Percentage ?? undefined,
                }
              : prev.progress,
            error: data.Error ?? prev.error,
            updatedAt: Date.now(),
          };
        });

        if (status === "COMPLETED") {
          stopPolling();
          void fetchResult(scanId);
        } else if (status === "FAILED" || status === "CANCELLED") {
          stopPolling();
        }
      } catch (error) {
        console.error("Failed to poll duplicate scan status:", error);
      }
    },
    [stopPolling, fetchResult],
  );

  const startPolling = React.useCallback(
    (scanId: string) => {
      stopPolling();
      pollRef.current = setInterval(() => {
        void pollStatus(scanId);
      }, POLL_INTERVAL_MS);
    },
    [stopPolling, pollStatus],
  );

  React.useEffect(() => {
    const unsubscribe = subscribe((payload) => {
      const rawScanId = payload.Data?.ScanId;
      if (!rawScanId) return;
      const scanId = String(rawScanId);

      setScanJob((prev) => {
        if (!prev || prev.scanId !== scanId) return prev;

        switch (payload.Type) {
          case NotificationType.DUPLICATE_SCAN_COMPLETE:
            stopPolling();
            void fetchResult(scanId);
            return { ...prev, state: "completed", updatedAt: Date.now() };

          case NotificationType.DUPLICATE_SCAN_FAILED:
            stopPolling();
            return {
              ...prev,
              state: "failed",
              error: (payload.Data?.Error as string) ?? prev.error,
              updatedAt: Date.now(),
            };

          case NotificationType.DUPLICATE_SCAN_CANCELLED:
            stopPolling();
            return { ...prev, state: "cancelled", updatedAt: Date.now() };

          default:
            return prev;
        }
      });
    });

    return unsubscribe;
  }, [subscribe, stopPolling, fetchResult]);

  React.useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const startDuplicateScan = React.useCallback(
    async (path: string, recursive?: boolean, similarityThreshold?: number) => {
      setScanJob({
        scanId: "",
        path,
        state: "starting",
        updatedAt: Date.now(),
      });

      try {
        const response = await cloudApiFactory.duplicateScanStart({
          cloudDuplicateScanStartRequestModel: {
            Path: path,
            Recursive: recursive,
            SimilarityThreshold: similarityThreshold,
          },
        });

        const result = response.data?.Result;
        const scanId = result?.ScanId;
        if (!scanId) {
          setScanJob((prev) =>
            prev
              ? {
                  ...prev,
                  state: "failed",
                  error: "No scan ID returned",
                  updatedAt: Date.now(),
                }
              : prev,
          );
          return;
        }

        setScanJob({
          scanId,
          path,
          state: "pending",
          updatedAt: Date.now(),
        });

        startPolling(scanId);
      } catch (error) {
        console.error("Failed to start duplicate scan:", error);
        setScanJob((prev) =>
          prev
            ? {
                ...prev,
                state: "failed",
                error: "Failed to start scan",
                updatedAt: Date.now(),
              }
            : prev,
        );
      }
    },
    [startPolling],
  );

  const cancelDuplicateScan = React.useCallback(async () => {
    const currentScanId = scanJob?.scanId;
    if (!currentScanId) return;

    try {
      await cloudApiFactory.duplicateScanCancel({
        cloudDuplicateScanIdRequestModel: {
          ScanId: currentScanId,
        },
      });
      stopPolling();
      setScanJob((prev) =>
        prev ? { ...prev, state: "cancelled", updatedAt: Date.now() } : prev,
      );
    } catch (error) {
      console.error("Failed to cancel duplicate scan:", error);
    }
  }, [scanJob, stopPolling]);

  const clearScanJob = React.useCallback(() => {
    stopPolling();
    setScanJob(null);
  }, [stopPolling]);

  return {
    scanJob,
    startDuplicateScan,
    cancelDuplicateScan,
    clearScanJob,
  };
}
