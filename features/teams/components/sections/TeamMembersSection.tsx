"use client";

import React from "react";
import { Loader2, MoreHorizontal, Shield, UserMinus, Crown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTeamMembers } from "../../hooks/useTeams";
import {
  useUpdateMemberRole,
  useRemoveMember,
  useTransferOwnership,
} from "../../hooks/useTeamMutations";
import { canManageMembers, isOwner } from "../../utils/permissions";
import { TeamRole, TeamMemberUpdateRoleRequestModelRoleEnum } from "@/types/team.types";
import type { TeamMemberResponseModel } from "@/types/team.types";
import RemoveMemberDialog from "../dialogs/RemoveMemberDialog";
import TransferOwnershipDialog from "../dialogs/TransferOwnershipDialog";
import toast from "react-hot-toast";

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

interface TeamMembersSectionProps {
  teamId: string;
  myRole?: string;
}

export default function TeamMembersSection({
  teamId,
  myRole,
}: TeamMembersSectionProps) {
  const { query: membersQuery } = useTeamMembers(teamId);
  const updateRoleMutation = useUpdateMemberRole(teamId);
  const removeMemberMutation = useRemoveMember(teamId);
  const transferMutation = useTransferOwnership(teamId);

  const [removeMember, setRemoveMember] =
    React.useState<TeamMemberResponseModel | null>(null);
  const [transferTarget, setTransferTarget] =
    React.useState<TeamMemberResponseModel | null>(null);

  const members: TeamMemberResponseModel[] =
    membersQuery.data?.Items ?? [];
  const canManage = canManageMembers(myRole);
  const amOwner = isOwner(myRole);

  const handleRoleChange = async (
    memberId: string,
    newRole: string,
  ) => {
    try {
      await updateRoleMutation.mutateAsync({
        memberId,
        role: newRole as TeamMemberUpdateRoleRequestModelRoleEnum,
      });
      toast.success("Rol güncellendi.");
    } catch {
      toast.error("Rol güncellenirken bir hata oluştu.");
    }
  };

  const handleRemoveMember = async () => {
    if (!removeMember) return;
    try {
      await removeMemberMutation.mutateAsync(removeMember.Id);
      toast.success("Üye takımdan çıkarıldı.");
      setRemoveMember(null);
    } catch {
      toast.error("Üye çıkarılırken bir hata oluştu.");
    }
  };

  const handleTransferOwnership = async () => {
    if (!transferTarget) return;
    try {
      await transferMutation.mutateAsync(transferTarget.UserId);
      toast.success("Sahiplik transfer edildi.");
      setTransferTarget(null);
    } catch {
      toast.error("Sahiplik transfer edilirken bir hata oluştu.");
    }
  };

  if (membersQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Üyeler ({members.length})
        </h3>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Üye</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="hidden sm:table-cell">
                Katılım Tarihi
              </TableHead>
              {canManage && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.Id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.Image ?? ""} />
                      <AvatarFallback className="text-xs">
                        {member.FullName?.[0]?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">
                        {member.FullName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {member.Email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {canManage && member.Role !== TeamRole.OWNER ? (
                    <Select
                      value={member.Role}
                      onValueChange={(val) =>
                        handleRoleChange(member.Id, val)
                      }
                    >
                      <SelectTrigger className="w-32 h-8 text-xs rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Yönetici</SelectItem>
                        <SelectItem value="MEMBER">Üye</SelectItem>
                        <SelectItem value="VIEWER">İzleyici</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      variant={
                        roleBadgeVariants[member.Role] ?? "outline"
                      }
                      className="text-xs"
                    >
                      {roleLabels[member.Role] ?? member.Role}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                  {member.JoinedAt
                    ? new Date(member.JoinedAt).toLocaleDateString("tr-TR")
                    : "-"}
                </TableCell>
                {canManage && (
                  <TableCell>
                    {member.Role !== TeamRole.OWNER && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          {amOwner && (
                            <DropdownMenuItem
                              onClick={() => setTransferTarget(member)}
                              className="gap-2"
                            >
                              <Crown className="h-4 w-4" />
                              Sahipliği Transfer Et
                            </DropdownMenuItem>
                          )}
                          {amOwner && <DropdownMenuSeparator />}
                          <DropdownMenuItem
                            onClick={() => setRemoveMember(member)}
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <UserMinus className="h-4 w-4" />
                            Takımdan Çıkar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <RemoveMemberDialog
        open={!!removeMember}
        onOpenChange={(open) => !open && setRemoveMember(null)}
        memberName={removeMember?.FullName ?? ""}
        onConfirm={handleRemoveMember}
        isPending={removeMemberMutation.isPending}
      />

      <TransferOwnershipDialog
        open={!!transferTarget}
        onOpenChange={(open) => !open && setTransferTarget(null)}
        memberName={transferTarget?.FullName ?? ""}
        onConfirm={handleTransferOwnership}
        isPending={transferMutation.isPending}
      />
    </div>
  );
}
