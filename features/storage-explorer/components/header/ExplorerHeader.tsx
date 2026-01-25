"use client";

import React from "react";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExplorerUI } from "../../contexts/ExplorerUIContext";
import ExplorerBreadcrumb from "./ExplorerBreadcrumb";
import ExplorerToolbar from "./ExplorerToolbar";

export default function ExplorerHeader() {
  const { viewMode, setViewMode, setIsMobileSidebarOpen } = useExplorerUI();

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
            {viewMode === "list" ? <List size={16} /> : <LayoutGrid size={16} />}
          </Button>
        </div>
      </div>

      <ExplorerToolbar />
    </div>
  );
}
