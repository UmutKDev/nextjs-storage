"use client";

import React from "react";
import { LayoutGrid, List, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useExplorerUI } from "../../contexts/ExplorerUIContext";
import ExplorerBreadcrumb from "./ExplorerBreadcrumb";
import ExplorerToolbar from "./ExplorerToolbar";
import { useWorkspace } from "@/features/teams/stores/workspace.store";
import { TeamRole } from "@/types/team.types";

const roleLabels: Record<string, string> = {
  [TeamRole.OWNER]: "Sahip",
  [TeamRole.ADMIN]: "Yönetici",
  [TeamRole.MEMBER]: "Üye",
  [TeamRole.VIEWER]: "İzleyici",
};

export default function ExplorerHeader() {
  const { viewMode, setViewMode, setIsMobileSidebarOpen } = useExplorerUI();
  const { activeTeamId, activeTeamName, activeTeamRole } = useWorkspace();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 border-b bg-card/50 backdrop-blur-sm shrink-0 gap-3 md:gap-4 box-border">
      <div className="flex items-center gap-2 w-full md:w-auto min-w-0">
        <Button
          variant="outline"
          size="icon"
          className="md:hidden shrink-0 h-8 w-8"
          onClick={() => setIsMobileSidebarOpen(true)}
        >
          <LayoutGrid size={16} />
        </Button>

        {activeTeamId && (
          <div className="hidden md:flex items-center gap-1.5 shrink-0 mr-1">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500">
              <Users className="h-3.5 w-3.5" />
              <span className="text-xs font-medium max-w-[100px] truncate">
                {activeTeamName}
              </span>
            </div>
            {activeTeamRole && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                {roleLabels[activeTeamRole] ?? activeTeamRole}
              </Badge>
            )}
          </div>
        )}

        <div className="flex-1 min-w-0 overflow-hidden">
          <ExplorerBreadcrumb />
        </div>

        <div className="flex md:hidden items-center border-l pl-2 ml-1 shrink-0">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
          >
            {viewMode === "list" ? (
              <List size={16} />
            ) : (
              <LayoutGrid size={16} />
            )}
          </Button>
        </div>
      </div>

      <ExplorerToolbar />
    </div>
  );
}
