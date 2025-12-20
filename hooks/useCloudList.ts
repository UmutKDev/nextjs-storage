"use client";

import { useCallback, useMemo } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { cloudApiFactory } from "@/Service/Factories";
import { useSession } from "next-auth/react";
import type {
  CloudDirectoryListModelResult,
  CloudObjectListModelResult,
} from "@/Service/Generates/api";
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
  skip?: number;
  take?: number;
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

/** "/" veya boş string'i normalize eder */
const normalizePath = (path?: string): string => {
  if (!path || path === "/") return "";
  return path.replace(/^\/+/, "");
};

// /** Parent path'i hesaplar, root için null döner */
// const getParentPath = (path: string): string | null => {
//   if (!path) return null;
//   const segments = path.split("/").filter(Boolean);
//   segments.pop();
//   return segments.join("/");
// };

/** Query key oluşturur */
export const createCloudListQueryKey = (
  path: string,
  delimiter = true,
  isMetadataProcessing = false
) => [...CLOUD_LIST_QUERY_KEY, path, delimiter, isMetadataProcessing] as const;

export const createCloudBreadcrumbQueryKey = (path: string, delimiter = true) =>
  [...CLOUD_BREADCRUMB_QUERY_KEY, path, delimiter] as const;

export const createCloudObjectsQueryKey = (
  path: string,
  delimiter = true,
  isMetadataProcessing = false,
  skip = 0,
  take = 100,
  search: string | undefined = undefined
) =>
  [
    ...CLOUD_OBJECTS_QUERY_KEY,
    path,
    delimiter,
    isMetadataProcessing,
    skip,
    take,
    search,
  ] as const;

export const createCloudDirectoriesQueryKey = (
  path: string,
  delimiter = true,
  skip = 0,
  take = 100,
  search: string | undefined = undefined
) =>
  [
    ...CLOUD_DIRECTORIES_QUERY_KEY,
    path,
    delimiter,
    skip,
    take,
    search,
  ] as const;

export const createInfiniteObjectsQueryKey = (
  path: string,
  delimiter = true,
  isMetadataProcessing = false,
  take = 100,
  search: string | undefined = undefined
) =>
  [
    ...CLOUD_OBJECTS_QUERY_KEY,
    path,
    delimiter,
    isMetadataProcessing,
    take,
    search,
    "infinite",
  ] as const;

export const createInfiniteDirectoriesQueryKey = (
  path: string,
  delimiter = true,
  take = 100,
  search: string | undefined = undefined
) =>
  [
    ...CLOUD_DIRECTORIES_QUERY_KEY,
    path,
    delimiter,
    take,
    search,
    "infinite",
  ] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useCloudList(path?: string, options?: UseCloudListOptions) {
  const { status } = useSession();
  const {
    delimiter = true,
    isMetadataProcessing = false,
    refetchOnMount = "always",
    enabled = true,
    skip = 0,
    take = 100,
    search = undefined,
    refetchInterval = false,
    objectsEnabled = true,
    directoriesEnabled = true,
    breadcrumbEnabled = true,
  } = options ?? {};

  const queryClient = useQueryClient();
  const normalizedPath = useMemo(() => normalizePath(path), [path]);

  const breadcrumbQueryKey = useMemo(
    () => createCloudBreadcrumbQueryKey(normalizedPath, delimiter),
    [normalizedPath, delimiter]
  );

  const directoriesQueryKey = useMemo(
    () =>
      createCloudDirectoriesQueryKey(
        normalizedPath,
        delimiter,
        skip,
        take,
        search
      ),
    [normalizedPath, delimiter, skip, take, search]
  );

  const objectsQueryKey = useMemo(
    () =>
      createCloudObjectsQueryKey(
        normalizedPath,
        delimiter,
        isMetadataProcessing,
        skip,
        take,
        search
      ),
    [normalizedPath, delimiter, isMetadataProcessing, skip, take, search]
  );

  // Ana query
  const breadcrumbQuery = useQuery({
    queryKey: breadcrumbQueryKey,
    queryFn: async ({ signal }) =>
      await cloudApiFactory.listBreadcrumb(
        { path: normalizedPath, delimiter },
        { signal }
      ),
    select: (res) => res.data?.result,
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
          skip,
          take,
          search,
        },
        { signal }
      ),
    select: (res) => res.data?.result,
    refetchOnMount,
    refetchOnWindowFocus: false,
    enabled: status === "authenticated" && enabled && objectsEnabled,
    refetchInterval: objectsEnabled ? refetchInterval : false,
  });

  const directoriesQuery = useQuery({
    queryKey: directoriesQueryKey,
    queryFn: async ({ signal }) =>
      await cloudApiFactory.listDirectories(
        { path: normalizedPath, delimiter, skip, take, search },
        { signal }
      ),
    select: (res) => res.data?.result,
    staleTime: STALE_TIME,
    refetchOnMount,
    refetchOnWindowFocus: false,
    enabled: status === "authenticated" && enabled && directoriesEnabled,
    refetchInterval: directoriesEnabled ? refetchInterval : false,
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
    [queryClient, normalizedPath]
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
    [queryClient, normalizedPath]
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
    [queryClient, normalizedPath]
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
    [queryClient, normalizedPath]
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

export function useInfiniteCloudList(
  path?: string,
  options?: UseCloudListOptions
) {
  const { status } = useSession();
  const {
    delimiter = true,
    isMetadataProcessing = false,
    refetchOnMount = "always",
    enabled = true,
    take = 100,
    search = undefined,
    refetchInterval = false,
    objectsEnabled = true,
    directoriesEnabled = true,
    breadcrumbEnabled = true,
  } = options ?? {};

  const queryClient = useQueryClient();
  const normalizedPath = useMemo(() => normalizePath(path), [path]);

  const breadcrumbQueryKey = useMemo(
    () => createCloudBreadcrumbQueryKey(normalizedPath, delimiter),
    [normalizedPath, delimiter]
  );

  const objectsQueryKey = useMemo(
    () =>
      createInfiniteObjectsQueryKey(
        normalizedPath,
        delimiter,
        isMetadataProcessing,
        take,
        search
      ),
    [normalizedPath, delimiter, isMetadataProcessing, take, search]
  );

  const directoriesQueryKey = useMemo(
    () =>
      createInfiniteDirectoriesQueryKey(
        normalizedPath,
        delimiter,
        take,
        search
      ),
    [normalizedPath, delimiter, take, search]
  );

  const breadcrumbQuery = useQuery({
    queryKey: breadcrumbQueryKey,
    queryFn: async ({ signal }) =>
      await cloudApiFactory.listBreadcrumb(
        { path: normalizedPath, delimiter },
        { signal }
      ),
    select: (res) => res.data?.result,
    staleTime: STALE_TIME,
    refetchOnMount,
    refetchOnWindowFocus: false,
    enabled: status === "authenticated" && enabled && breadcrumbEnabled,
  });

  const objectsQuery = useInfiniteQuery<
    CloudObjectListModelResult,
    Error,
    InfiniteData<CloudObjectListModelResult, number>,
    ReturnType<typeof createInfiniteObjectsQueryKey>,
    number
  >({
    queryKey: objectsQueryKey,
    queryFn: async ({ pageParam = 0, signal }) =>
      await cloudApiFactory
        .listObjects(
          {
            path: normalizedPath,
            delimiter,
            isMetadataProcessing,
            skip: pageParam,
            take,
            search,
          },
          { signal }
        )
        .then((res) => res.data?.result),
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      const total = lastPage.options?.count ?? 0;
      const nextSkip = (lastPage.options?.skip ?? 0) + take;
      if (nextSkip >= total) return undefined;
      return nextSkip;
    },
    initialPageParam: 0,
    refetchOnMount,
    refetchOnWindowFocus: false,
    enabled: status === "authenticated" && enabled && objectsEnabled,
    refetchInterval: objectsEnabled ? refetchInterval : false,
  });

  const directoriesQuery = useInfiniteQuery<
    CloudDirectoryListModelResult,
    Error,
    InfiniteData<CloudDirectoryListModelResult, number>,
    ReturnType<typeof createInfiniteDirectoriesQueryKey>,
    number
  >({
    queryKey: directoriesQueryKey,
    queryFn: async ({ pageParam = 0, signal }) =>
      await cloudApiFactory
        .listDirectories(
          { path: normalizedPath, delimiter, skip: pageParam, take, search },
          { signal }
        )
        .then((res) => res.data?.result),
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      const total = lastPage.options?.count ?? 0;
      const nextSkip = (lastPage.options?.skip ?? 0) + take;
      if (nextSkip >= total) return undefined;
      return nextSkip;
    },
    initialPageParam: 0,
    refetchOnMount,
    refetchOnWindowFocus: false,
    enabled: status === "authenticated" && enabled && directoriesEnabled,
    refetchInterval: directoriesEnabled ? refetchInterval : false,
  });

  const combinedObjects = useMemo(
    () =>
      objectsQuery.data?.pages?.flatMap((page) => page?.items ?? []) ?? [],
    [objectsQuery.data]
  );

  const combinedDirectories = useMemo(
    () =>
      directoriesQuery.data?.pages?.flatMap((page) => page?.items ?? []) ?? [],
    [directoriesQuery.data]
  );

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
    [queryClient, normalizedPath]
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
    [queryClient, normalizedPath]
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
    [queryClient, normalizedPath]
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
    [queryClient, normalizedPath]
  );

  return {
    breadcrumbQuery,
    objectsQuery,
    directoriesQuery,
    objects: combinedObjects,
    directories: combinedDirectories,
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

export default useCloudList;
