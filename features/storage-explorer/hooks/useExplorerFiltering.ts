"use client";

import React from "react";
import { useExplorerQuery } from "../contexts/ExplorerQueryContext";
import { useExplorerUI } from "../contexts/ExplorerUIContext";
import type { ExplorerDirectory, ExplorerFile } from "../types/explorer.types";

export function useExplorerFiltering() {
  const { objectsQuery, directoriesQuery } = useExplorerQuery();
  const { searchQuery } = useExplorerUI();

  const objectItems = React.useMemo<ExplorerFile[]>(
    () => objectsQuery.data?.Items ?? [],
    [objectsQuery.data],
  );

  const directoryItems = React.useMemo<ExplorerDirectory[]>(
    () => directoriesQuery.data?.Items ?? [],
    [directoriesQuery.data],
  );

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
