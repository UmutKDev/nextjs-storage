"use client";

import React from "react";
import { Loader2, Settings, Users, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useTeamDetail } from "../hooks/useTeams";
import { TeamRole } from "@/types/team.types";
import { canManageMembers } from "../utils/permissions";
import TeamMembersSection from "./sections/TeamMembersSection";
import TeamInvitationsSection from "./sections/TeamInvitationsSection";
import TeamSettingsSection from "./sections/TeamSettingsSection";

const roleLabels: Record<string, string> = {
  [TeamRole.OWNER]: "Sahip",
  [TeamRole.ADMIN]: "Yönetici",
  [TeamRole.MEMBER]: "Üye",
  [TeamRole.VIEWER]: "İzleyici",
};

interface TeamDetailViewProps {
  teamId: string;
  teamName?: string;
  myRole?: string;
}

export default function TeamDetailView({
  teamId,
  teamName,
  myRole,
}: TeamDetailViewProps) {
  const teamDetailQuery = useTeamDetail(teamId);
  const detail = teamDetailQuery.data;
  const role = detail?.MyRole ?? myRole;
  const canManage = canManageMembers(role);

  if (teamDetailQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
          <Users className="h-7 w-7" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">
              {detail?.Name ?? teamName ?? "Takım"}
            </h2>
            {role && (
              <Badge variant="secondary" className="text-xs">
                {roleLabels[role] ?? role}
              </Badge>
            )}
          </div>
          {detail?.Description && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {detail.Description}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {detail?.MemberCount ?? 0} üye
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="h-10 rounded-xl bg-muted/50 p-1">
          <TabsTrigger value="members" className="rounded-lg px-4 gap-2">
            <Users className="h-3.5 w-3.5" />
            Üyeler
          </TabsTrigger>
          {canManage && (
            <TabsTrigger value="invitations" className="rounded-lg px-4 gap-2">
              <Mail className="h-3.5 w-3.5" />
              Davetler
            </TabsTrigger>
          )}
          <TabsTrigger value="settings" className="rounded-lg px-4 gap-2">
            <Settings className="h-3.5 w-3.5" />
            Ayarlar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <TeamMembersSection teamId={teamId} myRole={role} />
        </TabsContent>

        {canManage && (
          <TabsContent value="invitations">
            <TeamInvitationsSection teamId={teamId} />
          </TabsContent>
        )}

        <TabsContent value="settings">
          <TeamSettingsSection teamId={teamId} myRole={role} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
