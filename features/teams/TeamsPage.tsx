"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Users, Plus, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeamList, usePendingInvitations } from "./hooks/useTeams";
import { TeamRole } from "@/types/team.types";
import type { TeamResponseModel } from "@/types/team.types";
import CreateTeamDialog from "./components/dialogs/CreateTeamDialog";
import TeamDetailView from "./components/TeamDetailView";
import PendingInvitationsTab from "./components/sections/PendingInvitationsTab";

const roleLabels: Record<string, string> = {
  [TeamRole.OWNER]: "Sahip",
  [TeamRole.ADMIN]: "Yönetici",
  [TeamRole.MEMBER]: "Üye",
  [TeamRole.VIEWER]: "İzleyici",
};

const roleBadgeVariants: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  [TeamRole.OWNER]: "default",
  [TeamRole.ADMIN]: "secondary",
  [TeamRole.MEMBER]: "outline",
  [TeamRole.VIEWER]: "outline",
};

export default function TeamsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTeamId = searchParams.get("team");

  const { query: teamListQuery } = useTeamList();
  const { query: pendingQuery } = usePendingInvitations();

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  const teams: TeamResponseModel[] = teamListQuery.data?.Items ?? [];
  const pendingCount = pendingQuery.data?.Items?.length ?? 0;

  if (selectedTeamId) {
    const selectedTeam = teams.find((t) => t.Id === selectedTeamId);
    return (
      <div className="min-h-screen pt-20 pb-8">
        <div className="container mx-auto max-w-5xl px-4">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 gap-2 rounded-lg"
            onClick={() => router.push("/teams")}
          >
            <ArrowLeft className="h-4 w-4" />
            Takımlara Dön
          </Button>
          <TeamDetailView
            teamId={selectedTeamId}
            teamName={selectedTeam?.Name}
            myRole={selectedTeam?.MyRole}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Takım Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Takımlarınızı oluşturun, yönetin ve üyelerinizi davet edin.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList className="h-10 rounded-xl bg-muted/50 p-1">
            <TabsTrigger value="teams" className="rounded-lg px-4">
              Takımlarım
            </TabsTrigger>
            <TabsTrigger value="invitations" className="rounded-lg px-4">
              Bekleyen Davetler
              {pendingCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                >
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            {teamListQuery.isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : teams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  Henüz takımınız yok
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                  Bir takım oluşturarak dosyalarınızı ekip arkadaşlarınızla
                  paylaşmaya başlayın.
                </p>
                <Button
                  className="gap-2 rounded-xl"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Yeni Takım Oluştur
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {teams.length} takım
                  </p>
                  <Button
                    size="sm"
                    className="gap-2 rounded-xl"
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Yeni Takım
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {teams.map((team) => (
                    <TeamCard
                      key={team.Id}
                      team={team}
                      onClick={() => router.push(`/teams?team=${team.Id}`)}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Pending Invitations Tab */}
          <TabsContent value="invitations">
            <PendingInvitationsTab />
          </TabsContent>
        </Tabs>

        <CreateTeamDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      </div>
    </div>
  );
}

function TeamCard({
  team,
  onClick,
}: {
  team: TeamResponseModel;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-4 p-5 rounded-2xl border bg-card/50 hover:bg-card/80 hover:shadow-md transition-all text-left w-full"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
        <Users className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-sm truncate">{team.Name}</h3>
          {team.MyRole && (
            <Badge
              variant={roleBadgeVariants[team.MyRole] ?? "outline"}
              className="text-[10px] px-1.5 py-0 h-4 shrink-0"
            >
              {roleLabels[team.MyRole] ?? team.MyRole}
            </Badge>
          )}
        </div>
        {team.Description && (
          <p className="text-xs text-muted-foreground truncate mb-1.5">
            {team.Description}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {team.MemberCount ?? 0} üye
        </p>
      </div>
    </button>
  );
}
