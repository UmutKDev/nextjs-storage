"use client";

import React from "react";
import {
  Users,
  ChevronDown,
  Check,
  Plus,
  HardDrive,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspace } from "../stores/workspace.store";
import { useTeamList } from "../hooks/useTeams";
import { TeamRole } from "@/types/team.types";
import type { TeamResponseModel } from "@/types/team.types";
import CreateTeamDialog from "./dialogs/CreateTeamDialog";

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

export default function WorkspaceSwitcher() {
  const { activeTeamId, activeTeamName, setActiveWorkspace } = useWorkspace();
  const { query: teamListQuery } = useTeamList();
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const teams: TeamResponseModel[] = teamListQuery.data?.Items ?? [];
  const isPersonal = !activeTeamId;

  const handleSelectPersonal = () => {
    setActiveWorkspace(null);
    setDropdownOpen(false);
  };

  const handleSelectTeam = (team: TeamResponseModel) => {
    setActiveWorkspace({
      id: team.Id,
      name: team.Name,
      role: team.MyRole ?? TeamRole.MEMBER,
    });
    setDropdownOpen(false);
  };

  const handleCreateTeam = () => {
    setDropdownOpen(false);
    setCreateDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between gap-2 h-12 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 px-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  isPersonal
                    ? "bg-primary/10 text-primary"
                    : "bg-blue-500/10 text-blue-500",
                )}
              >
                {isPersonal ? (
                  <HardDrive className="h-4 w-4" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm font-medium truncate max-w-[130px]">
                  {isPersonal ? "Kişisel Alan" : activeTeamName}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {isPersonal ? "Kişisel depolama" : "Takım alanı"}
                </span>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-64 p-2 rounded-xl">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-medium px-2">
            Çalışma Alanı
          </DropdownMenuLabel>

          {/* Personal workspace */}
          <DropdownMenuItem
            onClick={handleSelectPersonal}
            className="gap-3 p-2.5 rounded-lg cursor-pointer"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HardDrive className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">Kişisel Alan</div>
              <div className="text-[10px] text-muted-foreground">
                Kişisel depolama
              </div>
            </div>
            {isPersonal && (
              <Check className="h-4 w-4 text-primary shrink-0" />
            )}
          </DropdownMenuItem>

          {/* Teams section */}
          {(teams.length > 0 || teamListQuery.isLoading) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground font-medium px-2">
                Takımlar
              </DropdownMenuLabel>
            </>
          )}

          {teamListQuery.isLoading && (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {teams.map((team) => (
            <DropdownMenuItem
              key={team.Id}
              onClick={() => handleSelectTeam(team)}
              className="gap-3 p-2.5 rounded-lg cursor-pointer"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <Users className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {team.Name}
                  </span>
                  {team.MyRole && (
                    <Badge
                      variant={roleBadgeVariants[team.MyRole] ?? "outline"}
                      className="text-[9px] px-1.5 py-0 h-4 shrink-0"
                    >
                      {roleLabels[team.MyRole] ?? team.MyRole}
                    </Badge>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {team.MemberCount ?? 0} üye
                </div>
              </div>
              {activeTeamId === team.Id && (
                <Check className="h-4 w-4 text-primary shrink-0" />
              )}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          {/* Create team */}
          <DropdownMenuItem
            onClick={handleCreateTeam}
            className="gap-3 p-2.5 rounded-lg cursor-pointer text-primary"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-dashed border-primary/30">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Yeni Takım Oluştur</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateTeamDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
}
