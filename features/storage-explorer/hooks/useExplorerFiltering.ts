"use client";

import React from "react";
import { useExplorerQuery } from "../contexts/ExplorerQueryContext";
import { useExplorerUI } from "../contexts/ExplorerUIContext";
import type { ExplorerDirectory, ExplorerFile } from "../types/explorer.types";

const dedupeByKey = <T extends { Prefix?: string; Path?: { Key?: string } }>(
  entries: T[],
  getKey: (entry: T) => string | undefined,
) => {
  const seenKeys = new Set<string>();
  return entries.filter((entry) => {
    const key = getKey(entry);
    if (!key || seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });
};

export function useExplorerFiltering() {
  const { objectsQuery, directoriesQuery } = useExplorerQuery();
  const { searchQuery } = useExplorerUI();

  const objectItems = React.useMemo<ExplorerFile[]>(() => {
    const allEntries =
      objectsQuery.data?.pages?.flatMap((page) => page?.Items ?? []) ?? [];
    return dedupeByKey(allEntries, (entry) => entry.Path?.Key);
  }, [objectsQuery.data]);

  const directoryItems = React.useMemo<ExplorerDirectory[]>(() => {
    const allEntries =
      directoriesQuery.data?.pages?.flatMap((page) => page?.Items ?? []) ?? [];
    return dedupeByKey(allEntries, (entry) => entry.Prefix);
  }, [directoriesQuery.data]);

  const filteredObjectItems = React.useMemo(() => {
    if (!searchQuery) return objectItems;
    const query = searchQuery.toLowerCase();
    return objectItems.filter((entry) =>
      entry.Name?.toLowerCase().includes(query),
    );
  }, [objectItems, searchQuery]);

  const filteredDirectoryItems = React.useMemo(() => {
    if (!searchQuery) return directoryItems;
    const query = searchQuery.toLowerCase();
    return directoryItems.filter((entry) => {
      const prefix = entry.Prefix ?? "";
      const segments = prefix.split("/").filter(Boolean);
      const name = segments.length ? segments[segments.length - 1] : prefix;
      return name.toLowerCase().includes(query);
    });
  }, [directoryItems, searchQuery]);

  return {
    objectItems,
    directoryItems,
    filteredObjectItems,
    filteredDirectoryItems,
  };
}
