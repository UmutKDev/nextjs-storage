"use client";

import React from "react";
import { Loader2, Users, Check, X, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePendingInvitations } from "../../hooks/useTeams";
import {
  useAcceptInvitation,
  useDeclineInvitation,
} from "../../hooks/useTeamMutations";
import { useWorkspaceStore } from "../../stores/workspace.store";
import type { TeamInvitationResponseModel } from "@/types/team.types";
import toast from "react-hot-toast";

const roleLabels: Record<string, string> = {
  OWNER: "Sahip",
  ADMIN: "Yönetici",
  MEMBER: "Üye",
  VIEWER: "İzleyici",
};

export default function PendingInvitationsTab() {
  const { query } = usePendingInvitations();
  const invitations: TeamInvitationResponseModel[] = query.data?.Items ?? [];

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
          <Mail className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Bekleyen davet yok</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Size gönderilmiş bekleyen bir takım daveti bulunmuyor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {invitations.map((invitation) => (
        <InvitationCard key={invitation.Id} invitation={invitation} />
      ))}
    </div>
  );
}

function InvitationCard({
  invitation,
}: {
  invitation: TeamInvitationResponseModel;
}) {
  const acceptMutation = useAcceptInvitation();
  const declineMutation = useDeclineInvitation();
  const isPending = acceptMutation.isPending || declineMutation.isPending;

  const handleAccept = async () => {
    try {
      const response = await acceptMutation.mutateAsync(invitation.Token ?? "");
      const member = response.data?.Result;
      if (member) {
        useWorkspaceStore.getState().setActiveWorkspace({
          id: invitation.Id,
          name: invitation.TeamName ?? "Takım",
          role: member.Role ?? "MEMBER",
        });
      }
      toast.success(`"${invitation.TeamName}" takımına katıldınız.`);
    } catch {
      toast.error("Davet kabul edilirken bir hata oluştu.");
    }
  };

  const handleDecline = async () => {
    try {
      await declineMutation.mutateAsync(invitation.Id);
      toast.success("Davet reddedildi.");
    } catch {
      toast.error("Davet reddedilirken bir hata oluştu.");
    }
  };

  const expiresAt = new Date(invitation.ExpiresAt);
  const now = new Date();
  const daysLeft = Math.max(
    0,
    Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );

  return (
    <div className="flex items-start gap-4 p-5 rounded-2xl border bg-card/50">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
        <Users className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-sm truncate">
            {invitation.TeamName}
          </h3>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
            {roleLabels[invitation.Role] ?? invitation.Role}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {invitation.InvitedByName} tarafından davet edildiniz
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {daysLeft > 0 ? `${daysLeft} gün kaldı` : "Süresi doluyor"}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <Button
            size="sm"
            className="h-8 text-xs px-4 rounded-xl gap-1.5"
            onClick={handleAccept}
            disabled={isPending}
          >
            {acceptMutation.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            Kabul Et
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs px-4 rounded-xl gap-1.5"
            onClick={handleDecline}
            disabled={isPending}
          >
            {declineMutation.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <X className="h-3 w-3" />
            )}
            Reddet
          </Button>
        </div>
      </div>
    </div>
  );
}
