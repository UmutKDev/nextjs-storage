"use client";

import React from "react";
import { useExplorerQuery } from "../contexts/ExplorerQueryContext";
import type { ExplorerDirectory, ExplorerFile } from "../types/explorer.types";

const INFINITE_LOAD_ROOT_MARGIN = "200px";

export function useExplorerInfiniteLoad({
  objectItems,
  directoryItems,
}: {
  objectItems: ExplorerFile[];
  directoryItems: ExplorerDirectory[];
}) {
  const { objectsQuery, directoriesQuery } = useExplorerQuery();
  const totalFiles = React.useMemo(() => {
    const pages = objectsQuery.data?.pages ?? [];
    if (pages.length === 0) return 0;
    return pages[pages.length - 1]?.options?.count ?? 0;
  }, [objectsQuery.data]);

  const totalDirectories = React.useMemo(() => {
    const pages = directoriesQuery.data?.pages ?? [];
    if (pages.length === 0) return 0;
    return pages[pages.length - 1]?.options?.count ?? 0;
  }, [directoriesQuery.data]);

  const loadedItemCount = objectItems.length + directoryItems.length;
  const totalItemCount = (totalFiles || 0) + (totalDirectories || 0);

  const hasMoreObjects = objectsQuery.hasNextPage ?? false;
  const hasMoreDirectories = directoriesQuery.hasNextPage ?? false;
  const canLoadMore = hasMoreObjects || hasMoreDirectories;
  const isFetchingMore =
    objectsQuery.isFetchingNextPage || directoriesQuery.isFetchingNextPage;

  const {
    fetchNextPage: fetchNextObjects,
    isFetchingNextPage: isFetchingNextObjects,
  } = objectsQuery;
  const {
    fetchNextPage: fetchNextDirectories,
    isFetchingNextPage: isFetchingNextDirectories,
  } = directoriesQuery;

  const loadMoreTriggerRef = React.useRef<HTMLDivElement | null>(null);
  const loadMore = React.useCallback(() => {
    if (!canLoadMore) return;
    if (hasMoreDirectories && !isFetchingNextDirectories) {
      void fetchNextDirectories();
    }
    if (hasMoreObjects && !isFetchingNextObjects) {
      void fetchNextObjects();
    }
  }, [
    canLoadMore,
    fetchNextDirectories,
    fetchNextObjects,
    hasMoreDirectories,
    hasMoreObjects,
    isFetchingNextDirectories,
    isFetchingNextObjects,
  ]);

  React.useEffect(() => {
    const node = loadMoreTriggerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        loadMore();
      },
      { rootMargin: INFINITE_LOAD_ROOT_MARGIN }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  return {
    loadMoreTriggerRef,
    loadMore,
    canLoadMore,
    isFetchingMore,
    loadedItemCount,
    totalItemCount,
  };
}
