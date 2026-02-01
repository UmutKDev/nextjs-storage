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
  skip = 0,
  take = 100,
  search: string | undefined = undefined,
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
  search: string | undefined = undefined,
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
  isMetadataProcessing = IS_METADATA_PROCESSING_ENABLED,
  take = 100,
  search: string | undefined = undefined,
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
  search: string | undefined = undefined,
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
  const { getSessionToken } = useEncryptedFolders((state) => ({
    getSessionToken: state.getSessionToken,
  }));
  const {
    delimiter = true,
    isMetadataProcessing = IS_METADATA_PROCESSING_ENABLED,
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
        skip,
        take,
        search,
      ),
    [normalizedPath, delimiter, skip, take, search],
  );

  const objectsQueryKey = useMemo(
    () =>
      createCloudObjectsQueryKey(
        normalizedPath,
        delimiter,
        isMetadataProcessing,
        skip,
        take,
        search,
      ),
    [normalizedPath, delimiter, isMetadataProcessing, skip, take, search],
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
          skip,
          take,
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
          skip,
          take,
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

export function useInfiniteCloudList(
  path?: string,
  options?: UseCloudListOptions,
) {
  const { status } = useSession();
  const { getSessionToken } = useEncryptedFolders();
  const {
    delimiter = true,
    isMetadataProcessing = IS_METADATA_PROCESSING_ENABLED,
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
  const sessionToken = getSessionToken(normalizedPath);
  const sessionHeaders = sessionToken
    ? { "x-folder-session": sessionToken }
    : undefined;

  const breadcrumbQueryKey = useMemo(
    () => createCloudBreadcrumbQueryKey(normalizedPath, delimiter),
    [normalizedPath, delimiter],
  );

  const objectsQueryKey = useMemo(
    () =>
      createInfiniteObjectsQueryKey(
        normalizedPath,
        delimiter,
        isMetadataProcessing,
        take,
        search,
      ),
    [normalizedPath, delimiter, isMetadataProcessing, take, search],
  );

  const directoriesQueryKey = useMemo(
    () =>
      createInfiniteDirectoriesQueryKey(
        normalizedPath,
        delimiter,
        take,
        search,
      ),
    [normalizedPath, delimiter, take, search],
  );

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
            xFolderSession: sessionToken || undefined,
          },
          { signal },
        )
        .then((res) => res.data?.Result),
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      const total = lastPage.Options?.Count ?? 0;
      const currentSkip = lastPage.Options?.Skip ?? 0;
      const itemsCount = lastPage.Items?.length ?? 0;

      if (itemsCount === 0) return undefined;

      // If server returned fewer items than requested, it's likely the last page
      if (itemsCount < take) return undefined;

      const nextSkip = currentSkip + itemsCount;

      // Safety guard: stop when server does not advance the skip to prevent infinite loops
      if (nextSkip <= currentSkip) return undefined;
      if (total && nextSkip >= total) return undefined;
      return nextSkip;
    },
    initialPageParam: 0,
    refetchOnMount,
    refetchOnWindowFocus: false,
    enabled: status === "authenticated" && enabled && objectsEnabled,
    refetchInterval: objectsEnabled ? refetchInterval : false,
    retry: (failureCount, error) => {
      if (isAxiosError(error) && error.response?.status === 403) return false;
      return failureCount < 3;
    },
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
          {
            path: normalizedPath,
            delimiter,
            skip: pageParam,
            take,
            search,
            xFolderSession: sessionToken || undefined,
          },
          { signal },
        )
        .then((res) => res.data?.Result),
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      const total = lastPage.Options?.Count ?? 0;
      const currentSkip = lastPage.Options?.Skip ?? 0;
      const itemsCount = lastPage.Items?.length ?? 0;

      if (itemsCount === 0) return undefined;

      // If server returned fewer items than requested, it's likely the last page
      if (itemsCount < take) return undefined;

      const nextSkip = currentSkip + itemsCount;

      // Safety guard: stop when server does not advance the skip to prevent infinite loops
      if (nextSkip <= currentSkip) return undefined;
      if (total && nextSkip >= total) return undefined;
      return nextSkip;
    },
    initialPageParam: 0,
    refetchOnMount,
    refetchOnWindowFocus: false,
    enabled: status === "authenticated" && enabled && directoriesEnabled,
    refetchInterval: directoriesEnabled ? refetchInterval : false,
    retry: (failureCount, error) => {
      if (isAxiosError(error) && error.response?.status === 403) return false;
      return failureCount < 3;
    },
  });

  const combinedObjects = useMemo(() => {
    const all =
      objectsQuery.data?.pages?.flatMap((page) => page?.Items ?? []) ?? [];
    const seen = new Set<string>();
    return all.filter((item) => {
      const key = item.Path?.Key;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [objectsQuery.data]);

  const combinedDirectories = useMemo(() => {
    const all =
      directoriesQuery.data?.pages?.flatMap((page) => page?.Items ?? []) ?? [];
    const seen = new Set<string>();
    return all.filter((item) => {
      const key = item.Prefix;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [directoriesQuery.data]);

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
