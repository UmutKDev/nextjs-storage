"use client";

import React from "react";
import { Bell, Check, X, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePendingInvitations } from "../hooks/useTeams";
import {
  useAcceptInvitation,
  useDeclineInvitation,
} from "../hooks/useTeamMutations";
import { useWorkspaceStore } from "../stores/workspace.store";
import { toast } from "sonner";
import type { TeamInvitationResponseModel } from "@/types/team.types";

const roleLabels: Record<string, string> = {
  OWNER: "Sahip",
  ADMIN: "Yönetici",
  MEMBER: "Üye",
  VIEWER: "İzleyici",
};

export default function PendingInvitationsBadge() {
  const { query } = usePendingInvitations();
  const invitations: TeamInvitationResponseModel[] = query.data?.Items ?? [];
  const count = invitations.length;

  if (count === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {count > 9 ? "9+" : count}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl">
        <DropdownMenuLabel className="px-4 py-3">
          <span className="text-sm font-semibold">Bekleyen Davetler</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-80 overflow-y-auto">
          {invitations.map((invitation) => (
            <InvitationItem key={invitation.Id} invitation={invitation} />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function InvitationItem({
  invitation,
}: {
  invitation: TeamInvitationResponseModel;
}) {
  const acceptMutation = useAcceptInvitation();
  const declineMutation = useDeclineInvitation();
  const isPending = acceptMutation.isPending || declineMutation.isPending;

  const handleAccept = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await acceptMutation.mutateAsync(invitation.Id);
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

  const handleDecline = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    <div className="px-4 py-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 mt-0.5">
          <Users className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">
            {invitation.TeamName}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {invitation.InvitedByName} tarafından davet edildiniz
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              {roleLabels[invitation.Role] ?? invitation.Role}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {daysLeft > 0 ? `${daysLeft} gün kaldı` : "Süresi doluyor"}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Button
              size="sm"
              className="h-7 text-xs px-3 rounded-lg"
              onClick={handleAccept}
              disabled={isPending}
            >
              {acceptMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Check className="h-3 w-3 mr-1" />
              )}
              Kabul Et
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs px-3 rounded-lg text-muted-foreground"
              onClick={handleDecline}
              disabled={isPending}
            >
              {declineMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <X className="h-3 w-3 mr-1" />
              )}
              Reddet
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
