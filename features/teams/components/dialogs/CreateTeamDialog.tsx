"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateTeam } from "../../hooks/useTeamMutations";
import { useWorkspaceStore } from "../../stores/workspace.store";
import toast from "react-hot-toast";

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTeamDialog({
  open,
  onOpenChange,
}: CreateTeamDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const createTeam = useCreateTeam();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim().length < 2) {
      toast.error("Takım adı en az 2 karakter olmalıdır.");
      return;
    }

    try {
      const response = await createTeam.mutateAsync({
        Name: name.trim(),
        Description: description.trim() || undefined,
      });

      const newTeam = response.data?.Result;
      if (newTeam) {
        useWorkspaceStore.getState().setActiveWorkspace({
          id: newTeam.Id,
          name: newTeam.Name,
          role: newTeam.MyRole ?? "OWNER",
        });
        toast.success(`"${newTeam.Name}" takımı oluşturuldu.`);
      }

      setName("");
      setDescription("");
      onOpenChange(false);
    } catch {
      toast.error("Takım oluşturulurken bir hata oluştu.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Yeni Takım Oluştur</DialogTitle>
            <DialogDescription>
              Takımınız için bir ad ve açıklama belirleyin. Takım oluşturulduktan
              sonra üye davet edebilirsiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="team-name">
                Takım Adı <span className="text-destructive">*</span>
              </Label>
              <Input
                id="team-name"
                placeholder="Takım adını girin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                2-100 karakter arası olmalıdır.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="team-description">Açıklama</Label>
              <Input
                id="team-description"
                placeholder="Takım açıklaması (opsiyonel)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                Maksimum 500 karakter.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createTeam.isPending}
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={name.trim().length < 2 || createTeam.isPending}
            >
              {createTeam.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Oluştur
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
