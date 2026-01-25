"use client";

import React from "react";
import { useExplorerQuery } from "../contexts/ExplorerQueryContext";
import { useExplorerUI } from "../contexts/ExplorerUIContext";

export function useExplorerNavigation() {
  const { currentPath, objectsQuery, directoriesQuery } = useExplorerQuery();
  const { setIsNavigatingBetweenFolders } = useExplorerUI();
  const previousPathRef = React.useRef(currentPath);

  React.useEffect(() => {
    if (previousPathRef.current !== currentPath) {
      previousPathRef.current = currentPath;
      setIsNavigatingBetweenFolders(true);
    }
  }, [currentPath, setIsNavigatingBetweenFolders]);

  React.useEffect(() => {
    if (!objectsQuery.isFetching && !directoriesQuery.isFetching) {
      const timeoutId = setTimeout(
        () => setIsNavigatingBetweenFolders(false),
        120
      );
      return () => clearTimeout(timeoutId);
    }
    return;
  }, [
    directoriesQuery.isFetching,
    objectsQuery.isFetching,
    setIsNavigatingBetweenFolders,
  ]);
}
