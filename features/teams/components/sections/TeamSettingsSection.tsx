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
import toast from "react-hot-toast";
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
      toast.error("Takım adı en az 2 karakter olmalıdır.");
      return;
    }
    try {
      await updateTeam.mutateAsync({
        Name: name.trim(),
        Description: description.trim() || undefined,
      });
      toast.success("Takım bilgileri güncellendi.");
    } catch {
      toast.error("Güncelleme sırasında bir hata oluştu.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTeam.mutateAsync();
      useWorkspaceStore.getState().clearWorkspace();
      toast.success("Takım silindi.");
      router.push("/teams");
    } catch {
      toast.error("Takım silinirken bir hata oluştu.");
    }
  };

  const handleLeave = async () => {
    try {
      await leaveTeam.mutateAsync();
      useWorkspaceStore.getState().clearWorkspace();
      toast.success("Takımdan ayrıldınız.");
      router.push("/teams");
    } catch {
      toast.error("Takımdan ayrılırken bir hata oluştu.");
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
          <h3 className="text-sm font-semibold mb-4">Takım Bilgileri</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="settings-name">Takım Adı</Label>
              <Input
                id="settings-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="settings-desc">Açıklama</Label>
              <Input
                id="settings-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                placeholder="Takım açıklaması (opsiyonel)"
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
              Kaydet
            </Button>
          </form>
        </div>
      )}

      <Separator />

      {/* Danger Zone */}
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
        <h3 className="text-sm font-semibold text-destructive mb-4">
          Tehlikeli Bölge
        </h3>
        <div className="space-y-4">
          {amOwner ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Takımı Sil</p>
                <p className="text-xs text-muted-foreground">
                  Bu işlem geri alınamaz. Tüm takım verileri silinecektir.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="rounded-xl gap-2"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Takımı Sil
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Takımdan Ayrıl</p>
                <p className="text-xs text-muted-foreground">
                  Bu takımdan ayrıldığınızda erişiminiz kaldırılacaktır.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="rounded-xl gap-2"
                onClick={() => setLeaveDialogOpen(true)}
              >
                <LogOut className="h-4 w-4" />
                Ayrıl
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
