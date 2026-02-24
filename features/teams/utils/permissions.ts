import { TeamRole } from "@/types/team.types";

export function canManageTeam(role?: string | null): boolean {
  return role === TeamRole.OWNER || role === TeamRole.ADMIN;
}

export function canManageMembers(role?: string | null): boolean {
  return role === TeamRole.OWNER || role === TeamRole.ADMIN;
}

export function canUpload(role?: string | null): boolean {
  return role !== TeamRole.VIEWER;
}

export function canModifyFiles(role?: string | null): boolean {
  return role !== TeamRole.VIEWER;
}

export function isOwner(role?: string | null): boolean {
  return role === TeamRole.OWNER;
}

export function canPerformAction(
  activeTeamRole: string | null,
  checker: (role?: string | null) => boolean,
): boolean {
  if (!activeTeamRole) return true;
  return checker(activeTeamRole);
}
