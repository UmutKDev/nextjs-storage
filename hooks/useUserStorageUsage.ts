"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cloudApiFactory } from "@/Service/Factories";
import { useSession } from "next-auth/react";
import { useCallback, useMemo } from "react";
import { STALE_TIME } from "./useCloudList";
import { useWorkspaceStore } from "@/features/teams/stores/workspace.store";

export const CLOUD_USER_STORAGE_USAGE_QUERY_KEY = [
  "cloud",
  "user-storage-usage",
] as const;

export const createCloudUserStorageUsageQueryKey = (teamId?: string | null) =>
  [...CLOUD_USER_STORAGE_USAGE_QUERY_KEY, teamId ?? "personal"] as const;

export default function useUserStorageUsage() {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const activeTeamId = useWorkspaceStore((s) => s.activeTeamId);

  const userStorageUsageQueryKey = useMemo(
    () => createCloudUserStorageUsageQueryKey(activeTeamId),
    [activeTeamId],
  );

  const userStorageUsageQuery = useQuery({
    queryKey: userStorageUsageQueryKey,
    queryFn: async ({ signal }) =>
      await cloudApiFactory.userStorageUsage({}, { signal }),
    select: (res) => res.data?.Result,
    staleTime: STALE_TIME,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    enabled: status === "authenticated",
  });

  const invalidate = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: CLOUD_USER_STORAGE_USAGE_QUERY_KEY,
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === CLOUD_USER_STORAGE_USAGE_QUERY_KEY[0] &&
          q.queryKey[1] === CLOUD_USER_STORAGE_USAGE_QUERY_KEY[1],
      }),
    [queryClient],
  );

  return { userStorageUsageQueryKey, userStorageUsageQuery, invalidate };
}
