"use client";

import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspaceStore } from "../stores/workspace.store";
import { useStorage } from "@/components/Storage/StorageProvider";
import {
  CLOUD_BREADCRUMB_QUERY_KEY,
  CLOUD_OBJECTS_QUERY_KEY,
  CLOUD_DIRECTORIES_QUERY_KEY,
} from "@/hooks/useCloudList";

export default function WorkspaceSync() {
  const queryClient = useQueryClient();
  const activeTeamId = useWorkspaceStore((s) => s.activeTeamId);
  const prevTeamIdRef = React.useRef(activeTeamId);
  const { setCurrentPath } = useStorage();

  React.useEffect(() => {
    if (prevTeamIdRef.current === activeTeamId) return;
    prevTeamIdRef.current = activeTeamId;

    // Reset path to root on workspace switch
    setCurrentPath("");

    // Invalidate all cloud queries
    queryClient.invalidateQueries({ queryKey: CLOUD_BREADCRUMB_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: CLOUD_OBJECTS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: CLOUD_DIRECTORIES_QUERY_KEY });
    queryClient.invalidateQueries({
      queryKey: ["cloud", "user-storage-usage"],
    });
  }, [activeTeamId, queryClient, setCurrentPath]);

  return null;
}
