"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  teamApiFactory,
  teamInvitationsApiFactory,
  teamMembersApiFactory,
} from "@/Service/Factories";
import { useCallback } from "react";

export const TEAM_LIST_QUERY_KEY = ["teams", "list"] as const;
export const TEAM_DETAIL_QUERY_KEY = ["teams", "detail"] as const;
export const TEAM_MEMBERS_QUERY_KEY = ["teams", "members"] as const;
export const TEAM_INVITATIONS_QUERY_KEY = ["teams", "invitations"] as const;
export const TEAM_PENDING_INVITATIONS_QUERY_KEY = [
  "teams",
  "pending-invitations",
] as const;

export function useTeamList() {
  const { status } = useSession();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: TEAM_LIST_QUERY_KEY,
    queryFn: async ({ signal }) =>
      await teamApiFactory.list({ signal }),
    select: (res) => res.data?.Result,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: status === "authenticated",
  });

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: TEAM_LIST_QUERY_KEY }),
    [queryClient],
  );

  return { query, invalidate };
}

export function useTeamDetail(teamId: string | null) {
  const { status } = useSession();

  return useQuery({
    queryKey: [...TEAM_DETAIL_QUERY_KEY, teamId],
    queryFn: async ({ signal }) =>
      await teamApiFactory.find(
        { id: teamId!, xTeamId: teamId! },
        { signal },
      ),
    select: (res) => res.data?.Result,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: status === "authenticated" && !!teamId,
  });
}

export function useTeamMembers(teamId: string | null) {
  const { status } = useSession();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...TEAM_MEMBERS_QUERY_KEY, teamId],
    queryFn: async ({ signal }) =>
      await teamMembersApiFactory.list(
        { xTeamId: teamId! },
        { signal },
      ),
    select: (res) => res.data?.Result,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: status === "authenticated" && !!teamId,
  });

  const invalidate = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: [...TEAM_MEMBERS_QUERY_KEY, teamId],
      }),
    [queryClient, teamId],
  );

  return { query, invalidate };
}

export function useTeamInvitations(teamId: string | null) {
  const { status } = useSession();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...TEAM_INVITATIONS_QUERY_KEY, teamId],
    queryFn: async ({ signal }) =>
      await teamInvitationsApiFactory.listForTeam(
        { xTeamId: teamId! },
        { signal },
      ),
    select: (res) => res.data?.Result,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: status === "authenticated" && !!teamId,
  });

  const invalidate = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: [...TEAM_INVITATIONS_QUERY_KEY, teamId],
      }),
    [queryClient, teamId],
  );

  return { query, invalidate };
}

export function usePendingInvitations() {
  const { status } = useSession();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: TEAM_PENDING_INVITATIONS_QUERY_KEY,
    queryFn: async ({ signal }) =>
      await teamInvitationsApiFactory.listPending({ signal }),
    select: (res) => res.data?.Result,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000,
    enabled: status === "authenticated",
  });

  const invalidate = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: TEAM_PENDING_INVITATIONS_QUERY_KEY,
      }),
    [queryClient],
  );

  return { query, invalidate };
}
