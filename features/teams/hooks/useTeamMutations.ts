"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  teamApiFactory,
  teamInvitationsApiFactory,
  teamMembersApiFactory,
} from "@/Service/Factories";
import {
  TEAM_LIST_QUERY_KEY,
  TEAM_MEMBERS_QUERY_KEY,
  TEAM_INVITATIONS_QUERY_KEY,
  TEAM_PENDING_INVITATIONS_QUERY_KEY,
} from "./useTeams";
import type {
  TeamCreateRequestModel,
  TeamUpdateRequestModel,
  TeamMemberUpdateRoleRequestModelRoleEnum,
} from "@/types/team.types";

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TeamCreateRequestModel) =>
      teamApiFactory.create({ teamCreateRequestModel: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_LIST_QUERY_KEY });
    },
  });
}

export function useUpdateTeam(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TeamUpdateRequestModel) =>
      teamApiFactory.update({
        id: teamId,
        xTeamId: teamId,
        teamUpdateRequestModel: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_LIST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["teams", "detail", teamId] });
    },
  });
}

export function useDeleteTeam(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => teamApiFactory._delete({ id: teamId, xTeamId: teamId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_LIST_QUERY_KEY });
    },
  });
}

export function useUpdateMemberRole(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: string;
      role: TeamMemberUpdateRoleRequestModelRoleEnum;
    }) =>
      teamMembersApiFactory.updateRole({
        xTeamId: teamId,
        memberId,
        teamMemberUpdateRoleRequestModel: { Role: role },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...TEAM_MEMBERS_QUERY_KEY, teamId],
      });
    },
  });
}

export function useRemoveMember(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) =>
      teamMembersApiFactory.remove({ xTeamId: teamId, memberId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...TEAM_MEMBERS_QUERY_KEY, teamId],
      });
      queryClient.invalidateQueries({ queryKey: TEAM_LIST_QUERY_KEY });
    },
  });
}

export function useLeaveTeam(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => teamMembersApiFactory.leave({ xTeamId: teamId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_LIST_QUERY_KEY });
    },
  });
}

export function useTransferOwnership(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      teamMembersApiFactory.transferOwnership({
        xTeamId: teamId,
        teamTransferOwnershipRequestModel: { UserId: userId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...TEAM_MEMBERS_QUERY_KEY, teamId],
      });
      queryClient.invalidateQueries({ queryKey: TEAM_LIST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["teams", "detail", teamId] });
    },
  });
}

export function useCreateInvitation(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; role?: string }) =>
      teamInvitationsApiFactory.create({
        xTeamId: teamId,
        teamInvitationCreateRequestModel: {
          Email: data.email,
          Role: data.role as never,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...TEAM_INVITATIONS_QUERY_KEY, teamId],
      });
    },
  });
}

export function useCancelInvitation(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      teamInvitationsApiFactory.cancel({ id: invitationId, xTeamId: teamId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...TEAM_INVITATIONS_QUERY_KEY, teamId],
      });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) =>
      teamInvitationsApiFactory.accept({
        teamInvitationAcceptRequestModel: { Token: token },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_LIST_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: TEAM_PENDING_INVITATIONS_QUERY_KEY,
      });
    },
  });
}

export function useDeclineInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) =>
      teamInvitationsApiFactory.decline({
        teamInvitationDeclineRequestModel: { Token: token },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEAM_PENDING_INVITATIONS_QUERY_KEY,
      });
    },
  });
}
