"use client";

import { useCallback, useMemo } from "react";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { cloudApiFactory } from "@/Service/Factories";
import { useSession } from "next-auth/react";
import type {
  CloudDirectoryListModelResult,
  CloudObjectListModelResult,
} from "@/Service/Generates/api";
import type { UseQueryResult } from "@tanstack/react-query";
import { useEncryptedFolders } from "@/components/Storage/stores/encryptedFolders.store";
import { isAxiosError } from "axios";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface UseCloudListOptions {
  delimiter?: boolean;
  isMetadataProcessing?: boolean;
  prefetchNeighbors?: boolean;
  refetchOnMount?: boolean | "always";
  /**
   * Controls whether the internal list queries should run.
   * Defaults to true (queries run when authenticated). Set to false to only
   * use the helpers (invalidates) without triggering network requests.
   */
  enabled?: boolean;
  search?: string | undefined;
  refetchInterval?: number | false;
  objectsEnabled?: boolean;
  directoriesEnabled?: boolean;
  breadcrumbEnabled?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export const CLOUD_LIST_QUERY_KEY = ["cloud", "list"] as const;
export const CLOUD_BREADCRUMB_QUERY_KEY = ["cloud", "breadcrumb"] as const;
export const CLOUD_OBJECTS_QUERY_KEY = ["cloud", "objects"] as const;
export const CLOUD_DIRECTORIES_QUERY_KEY = ["cloud", "directories"] as const;
export const STALE_TIME = 60 * 1000; // 1 minute

export const IS_METADATA_PROCESSING_ENABLED = true;

/** "/" veya boş string'i normalize eder */
const normalizePath = (path?: string): string => {
  if (!path || path === "/") return "";
  return path.replace(/^\/+/, "");
};

/** Query key oluşturur */
export const createCloudListQueryKey = (
  path: string,
  delimiter = true,
  isMetadataProcessing = IS_METADATA_PROCESSING_ENABLED,
) => [...CLOUD_LIST_QUERY_KEY, path, delimiter, isMetadataProcessing] as const;

export const createCloudBreadcrumbQueryKey = (path: string, delimiter = true) =>
  [...CLOUD_BREADCRUMB_QUERY_KEY, path, delimiter] as const;

export const createCloudObjectsQueryKey = (
  path: string,
  delimiter = true,
  isMetadataProcessing = IS_METADATA_PROCESSING_ENABLED,
  search: string | undefined = undefined,
) =>
  [
    ...CLOUD_OBJECTS_QUERY_KEY,
    path,
    delimiter,
    isMetadataProcessing,
    search,
  ] as const;

export const createCloudDirectoriesQueryKey = (
  path: string,
  delimiter = true,
  search: string | undefined = undefined,
) =>
  [
    ...CLOUD_DIRECTORIES_QUERY_KEY,
    path,
    delimiter,
    search,
  ] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useCloudList(path?: string, options?: UseCloudListOptions) {
  const { status } = useSession();
  const { getSessionToken } = useEncryptedFolders((state) => ({
    getSessionToken: state.getSessionToken,
  }));
  const {
    delimiter = true,
    isMetadataProcessing = IS_METADATA_PROCESSING_ENABLED,
    refetchOnMount = "always",
    enabled = true,
    search = undefined,
    refetchInterval = false,
    objectsEnabled = true,
    directoriesEnabled = true,
    breadcrumbEnabled = true,
  } = options ?? {};

  const queryClient = useQueryClient();
  const normalizedPath = useMemo(() => normalizePath(path), [path]);
  const sessionToken = getSessionToken(normalizedPath);
  const sessionHeaders = sessionToken
    ? { "x-folder-session": sessionToken }
    : undefined;

  const breadcrumbQueryKey = useMemo(
    () => createCloudBreadcrumbQueryKey(normalizedPath, delimiter),
    [normalizedPath, delimiter],
  );

  const directoriesQueryKey = useMemo(
    () =>
      createCloudDirectoriesQueryKey(
        normalizedPath,
        delimiter,
        search,
      ),
    [normalizedPath, delimiter, search],
  );

  const objectsQueryKey = useMemo(
    () =>
      createCloudObjectsQueryKey(
        normalizedPath,
        delimiter,
        isMetadataProcessing,
        search,
      ),
    [normalizedPath, delimiter, isMetadataProcessing, search],
  );

  // Ana query
  const breadcrumbQuery = useQuery({
    queryKey: breadcrumbQueryKey,
    queryFn: async ({ signal }) =>
      await cloudApiFactory.listBreadcrumb(
        { path: normalizedPath, delimiter },
        sessionHeaders ? { signal, headers: sessionHeaders } : { signal },
      ),
    select: (res) => res.data?.Result,
    staleTime: STALE_TIME,
    refetchOnMount,
    refetchOnWindowFocus: false,
    enabled: status === "authenticated" && enabled && breadcrumbEnabled,
  });

  const objectsQuery = useQuery({
    queryKey: objectsQueryKey,
    queryFn: async ({ signal }) =>
      await cloudApiFactory.listObjects(
        {
          path: normalizedPath,
          delimiter,
          isMetadataProcessing,
          search,
          xFolderSession: sessionToken || undefined,
        },
        { signal },
      ),
    select: (res) => res.data?.Result,
    refetchOnMount,
    refetchOnWindowFocus: false,
    enabled: status === "authenticated" && enabled && objectsEnabled,
    refetchInterval: objectsEnabled ? refetchInterval : false,
    retry: (failureCount, error) => {
      if (isAxiosError(error) && error.response?.status === 403) return false;
      return failureCount < 3;
    },
  });

  const directoriesQuery = useQuery({
    queryKey: directoriesQueryKey,
    queryFn: async ({ signal }) =>
      await cloudApiFactory.listDirectories(
        {
          path: normalizedPath,
          delimiter,
          search,
          xFolderSession: sessionToken || undefined,
        },
        { signal },
      ),
    select: (res) => res.data?.Result,
    staleTime: STALE_TIME,
    refetchOnMount,
    refetchOnWindowFocus: false,
    enabled: status === "authenticated" && enabled && directoriesEnabled,
    refetchInterval: directoriesEnabled ? refetchInterval : false,
    retry: (failureCount, error) => {
      if (isAxiosError(error) && error.response?.status === 403) return false;
      return failureCount < 3;
    },
  });

  // Invalidate helper - mevcut path için cache'i temizler
  const invalidate = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: CLOUD_LIST_QUERY_KEY,
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === CLOUD_LIST_QUERY_KEY[0] &&
          q.queryKey[1] === CLOUD_LIST_QUERY_KEY[1] &&
          q.queryKey[2] === normalizedPath,
      }),
    [queryClient, normalizedPath],
  );

  const invalidateBreadcrumb = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: CLOUD_BREADCRUMB_QUERY_KEY,
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === CLOUD_BREADCRUMB_QUERY_KEY[0] &&
          q.queryKey[1] === CLOUD_BREADCRUMB_QUERY_KEY[1] &&
          q.queryKey[2] === normalizedPath,
      }),
    [queryClient, normalizedPath],
  );

  const invalidateObjects = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: CLOUD_OBJECTS_QUERY_KEY,
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === CLOUD_OBJECTS_QUERY_KEY[0] &&
          q.queryKey[1] === CLOUD_OBJECTS_QUERY_KEY[1] &&
          q.queryKey[2] === normalizedPath,
      }),
    [queryClient, normalizedPath],
  );

  const invalidateDirectories = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: CLOUD_DIRECTORIES_QUERY_KEY,
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === CLOUD_DIRECTORIES_QUERY_KEY[0] &&
          q.queryKey[1] === CLOUD_DIRECTORIES_QUERY_KEY[1] &&
          q.queryKey[2] === normalizedPath,
      }),
    [queryClient, normalizedPath],
  );

  return {
    breadcrumbQuery,
    objectsQuery,
    directoriesQuery,
    invalidates: {
      invalidate,
      invalidateBreadcrumb,
      invalidateObjects,
      invalidateDirectories,
    },
    currentPath: normalizedPath,
    isRoot: normalizedPath === "",
  };
}

export type { UseCloudListOptions, UseQueryResult };

export default useCloudList;
