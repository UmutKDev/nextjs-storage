"use client";

import React from "react";
import { Loader2, Mail, X, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTeamInvitations } from "../../hooks/useTeams";
import {
  useCreateInvitation,
  useCancelInvitation,
} from "../../hooks/useTeamMutations";
import type { TeamInvitationResponseModel } from "@/types/team.types";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  ADMIN: "Yönetici",
  MEMBER: "Üye",
  VIEWER: "İzleyici",
};

interface TeamInvitationsSectionProps {
  teamId: string;
}

export default function TeamInvitationsSection({
  teamId,
}: TeamInvitationsSectionProps) {
  const { query: invitationsQuery } = useTeamInvitations(teamId);
  const createInvitation = useCreateInvitation(teamId);
  const cancelInvitation = useCancelInvitation(teamId);

  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("MEMBER");

  const invitations: TeamInvitationResponseModel[] =
    invitationsQuery.data?.Items ?? [];

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await createInvitation.mutateAsync({
        email: email.trim(),
        role,
      });
      toast.success(`${email} adresine davet gönderildi.`);
      setEmail("");
      setRole("MEMBER");
    } catch {
      toast.error("Davet gönderilirken bir hata oluştu.");
    }
  };

  const handleCancel = async (invitationId: string) => {
    try {
      await cancelInvitation.mutateAsync(invitationId);
      toast.success("Davet iptal edildi.");
    } catch {
      toast.error("Davet iptal edilirken bir hata oluştu.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Invite Form */}
      <div className="rounded-2xl border bg-card/50 p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Üye Davet Et
        </h3>
        <form
          onSubmit={handleInvite}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1">
            <Label htmlFor="invite-email" className="sr-only">
              E-posta
            </Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="E-posta adresi"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-full sm:w-36 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Yönetici</SelectItem>
              <SelectItem value="MEMBER">Üye</SelectItem>
              <SelectItem value="VIEWER">İzleyici</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="submit"
            disabled={!email.trim() || createInvitation.isPending}
            className="rounded-xl gap-2"
          >
            {createInvitation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            Davet Gönder
          </Button>
        </form>
      </div>

      {/* Pending Invitations */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Bekleyen Davetler ({invitations.length})
        </h3>

        {invitationsQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Bekleyen davet bulunmuyor.
          </div>
        ) : (
          <div className="space-y-2">
            {invitations.map((invitation) => (
              <div
                key={invitation.Id}
                className="flex items-center justify-between p-4 rounded-xl border bg-card/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {invitation.Email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(invitation.CreatedAt).toLocaleDateString(
                        "tr-TR",
                      )}{" "}
                      tarihinde gönderildi
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs">
                    {roleLabels[invitation.Role] ?? invitation.Role}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                    onClick={() => handleCancel(invitation.Id)}
                    disabled={cancelInvitation.isPending}
                  >
                    {cancelInvitation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
