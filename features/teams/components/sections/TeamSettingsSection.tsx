"use client";

import React from "react";
import { Loader2, Save, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useTeamDetail } from "../../hooks/useTeams";
import {
  useUpdateTeam,
  useDeleteTeam,
  useLeaveTeam,
} from "../../hooks/useTeamMutations";
import { isOwner, canManageTeam } from "../../utils/permissions";
import DeleteTeamDialog from "../dialogs/DeleteTeamDialog";
import LeaveTeamDialog from "../dialogs/LeaveTeamDialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWorkspaceStore } from "../../stores/workspace.store";

interface TeamSettingsSectionProps {
  teamId: string;
  myRole?: string;
}

export default function TeamSettingsSection({
  teamId,
  myRole,
}: TeamSettingsSectionProps) {
  const router = useRouter();
  const teamDetailQuery = useTeamDetail(teamId);
  const updateTeam = useUpdateTeam(teamId);
  const deleteTeam = useDeleteTeam(teamId);
  const leaveTeam = useLeaveTeam(teamId);

  const detail = teamDetailQuery.data;
  const amOwner = isOwner(myRole);
  const canEdit = canManageTeam(myRole);

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (detail) {
      setName(detail.Name ?? "");
      setDescription(detail.Description ?? "");
    }
  }, [detail]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Team name must be at least 2 characters.");
      return;
    }
    try {
      await updateTeam.mutateAsync({
        Name: name.trim(),
        Description: description.trim() || undefined,
      });
      toast.success("Team information updated.");
    } catch {
      toast.error("An error occurred while updating.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTeam.mutateAsync();
      useWorkspaceStore.getState().clearWorkspace();
      toast.success("Team deleted.");
      router.push("/teams");
    } catch {
      toast.error("An error occurred while deleting the team.");
    }
  };

  const handleLeave = async () => {
    try {
      await leaveTeam.mutateAsync();
      useWorkspaceStore.getState().clearWorkspace();
      toast.success("You left the team.");
      router.push("/teams");
    } catch {
      toast.error("An error occurred while leaving the team.");
    }
  };

  if (teamDetailQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Edit Team */}
      {canEdit && (
        <div className="rounded-2xl border bg-card/50 p-6">
          <h3 className="text-sm font-semibold mb-4">Team Information</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="settings-name">Team Name</Label>
              <Input
                id="settings-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="settings-desc">Description</Label>
              <Input
                id="settings-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                placeholder="Team description (optional)"
                className="rounded-xl"
              />
            </div>
            <Button
              type="submit"
              disabled={name.trim().length < 2 || updateTeam.isPending}
              className="rounded-xl gap-2"
            >
              {updateTeam.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </Button>
          </form>
        </div>
      )}

      <Separator />

      {/* Danger Zone */}
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
        <h3 className="text-sm font-semibold text-destructive mb-4">
          Danger Zone
        </h3>
        <div className="space-y-4">
          {amOwner ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Delete Team</p>
                <p className="text-xs text-muted-foreground">
                  This action cannot be undone. All team data will be deleted.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="rounded-xl gap-2"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete Team
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Leave Team</p>
                <p className="text-xs text-muted-foreground">
                  Your access will be revoked when you leave this team.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="rounded-xl gap-2"
                onClick={() => setLeaveDialogOpen(true)}
              >
                <LogOut className="h-4 w-4" />
                Leave
              </Button>
            </div>
          )}
        </div>
      </div>

      <DeleteTeamDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        teamName={detail?.Name ?? ""}
        onConfirm={handleDelete}
        isPending={deleteTeam.isPending}
      />

      <LeaveTeamDialog
        open={leaveDialogOpen}
        onOpenChange={setLeaveDialogOpen}
        teamName={detail?.Name ?? ""}
        onConfirm={handleLeave}
        isPending={leaveTeam.isPending}
      />
    </div>
  );
}
