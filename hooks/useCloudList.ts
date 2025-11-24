"use client";

import { useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CloudListResponseModel,
  CloudDirectoryModel,
} from "@/Service/Generates/api";
import { cloudApiFactory } from "@/Service/Factories";

/**
 * Fetch cloud list for a path. Returns the API model result (Breadcrumb, Directories, Contents)
 */
export function useCloudList(
  path?: string,
  opts?: {
    delimiter?: boolean;
    isMetadataProcessing?: boolean;
    /** When true, the hook will try to prefetch a couple of sibling/child queries for faster navigation */
    prefetchNeighbors?: boolean;
    /** 'always' will always refetch when the query is mounted (e.g. navigating back to a previous path) */
    refetchOnMount?: boolean | "always";
  }
) {
  // Normalize incoming path: treat `"/"` and falsy as root (empty string), strip leading slashes for consistency
  const normalized = path === "/" || !path ? "" : path.replace(/^\/+/, "");

  const {
    delimiter = true,
    isMetadataProcessing = false,
    // default off to avoid unexpected prefetches on refresh; enable when desired
    prefetchNeighbors = false,
    refetchOnMount = "always",
  } = opts ?? {};

  // Build a deterministic key so React Query caching works across callers
  const key = [
    "cloud",
    "list",
    normalized,
    delimiter,
    isMetadataProcessing,
  ] as const;

  // Query function supports cancellation via the provided `signal` so navigations can abort inflight requests
  const queryFn = async ({ signal }: { signal?: AbortSignal }) => {
    const res = await cloudApiFactory.list(
      { path: normalized, delimiter, isMetadataProcessing },
      { signal }
    );

    // The generated client returns a wrapper like { data: { result: CloudListResponseModel } }
    return res.data?.result;
  };

  const query = useQuery<
    CloudListResponseModel | undefined,
    unknown,
    CloudListResponseModel | undefined
  >({
    queryKey: key,
    queryFn,
    staleTime: 1000 * 60, // 1 minute
    refetchOnMount,
    refetchOnWindowFocus: false,
  });

  // Prefetch some neighbors for faster navigation
  const queryClient = useQueryClient();

  useEffect(() => {
    // Don't prefetch children/parent until the main query successfully returned data.
    // This prevents extra background requests on page load/refresh.
    if (!prefetchNeighbors) return;
    if (!query.isSuccess) return;

    // Prefetch parent path (if exists) and the first few directory prefixes
    const parent = (() => {
      if (!normalized) return null;
      const segments = normalized.split("/").filter(Boolean);
      segments.pop();
      return segments.join("/");
    })();

    if (parent !== null) {
      // parent may be empty string meaning root
      queryClient.prefetchQuery({
        queryKey: ["cloud", "list", parent, delimiter, isMetadataProcessing],
        queryFn: async () => {
          const r = await cloudApiFactory.list({ path: parent }, {});
          return r.data?.result;
        },
      });
    }

    const directories = (query.data?.Directories ??
      []) as CloudDirectoryModel[];
    // prefetch the first two directories so navigation to them feels instantaneous
    directories.slice(0, 2).forEach((d) => {
      const prefix = d.Prefix ?? "";
      if (!prefix) return;
      queryClient.prefetchQuery({
        queryKey: ["cloud", "list", prefix, delimiter, isMetadataProcessing],
        queryFn: async () => {
          const r = await cloudApiFactory.list({ path: prefix }, {});
          return r.data?.result;
        },
      });
    });
  }, [
    normalized,
    prefetchNeighbors,
    delimiter,
    isMetadataProcessing,
    query.data,
    query.isSuccess,
    queryClient,
  ]);

  // Helper: compute if current path is root
  const isRoot = normalized === "";

  // Helper to quickly trigger a prefetch for a given path
  const prefetchPath = useCallback(
    (p: string) =>
      queryClient.prefetchQuery({
        queryKey: ["cloud", "list", p, delimiter, isMetadataProcessing],
        queryFn: async () => {
          const r = await cloudApiFactory.list({ path: p }, {});
          return r.data?.result;
        },
      }),
    [queryClient, delimiter, isMetadataProcessing]
  );

  return {
    // React Query result spread (isLoading, data, etc.)
    ...query,
    // contextual helpers
    currentPath: normalized,
    isRoot,
    prefetchPath,
  } as const;
}

export default useCloudList;
