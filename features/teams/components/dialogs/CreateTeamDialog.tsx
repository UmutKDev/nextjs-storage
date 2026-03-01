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
import { toast } from "sonner";

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
      toast.error("Team name must be at least 2 characters.");
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
        toast.success(`"${newTeam.Name}" team created.`);
      }

      setName("");
      setDescription("");
      onOpenChange(false);
    } catch {
      toast.error("An error occurred while creating the team.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Set a name and description for your team. After the team is
              created, you can invite members.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="team-name">
                Team Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="team-name"
                placeholder="Enter team name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Must be between 2-100 characters.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="team-description">Description</Label>
              <Input
                id="team-description"
                placeholder="Team description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                Maximum 500 characters.
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
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={name.trim().length < 2 || createTeam.isPending}
            >
              {createTeam.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
