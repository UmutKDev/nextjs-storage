"use client";

import React from "react";
import {
  HardDrive,
  Clock,
  Trash2,
  Cloud,
  Star,
  Plus,
  UploadCloud,
  FolderPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import StorageUsage from "./StorageUsage";
import useUserStorageUsage from "@/hooks/useUserStorageUsage";
import { useStorage } from "./StorageProvider";
import { useExplorerEncryption } from "@/features/storage-explorer/contexts/ExplorerEncryptionContext";
import { useDialogs } from "@/features/storage-explorer/contexts/DialogsContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import WorkspaceSwitcher from "@/features/teams/components/WorkspaceSwitcher";
import { useWorkspace } from "@/features/teams/stores/workspace.store";
import {
  canPerformAction,
  canUpload,
} from "@/features/teams/utils/permissions";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { userStorageUsageQuery } = useUserStorageUsage();
  const { currentPath, setCurrentPath } = useStorage();
  const { openDialog } = useDialogs();
  const { isExplorerLocked } = useExplorerEncryption();
  const { activeTeamRole } = useWorkspace();

  const canUploadFiles = canPerformAction(activeTeamRole, canUpload);
  const isUploadBlocked = isExplorerLocked || !canUploadFiles;

  const navItems = [
    {
      label: "Dosyalarım",
      icon: HardDrive,
      path: "/",
      active: currentPath === "/" || currentPath === "",
      onClick: () => setCurrentPath(""),
    },
    {
      label: "Son Kullanılanlar",
      icon: Clock,
      path: "/recent",
      active: false,
      onClick: () => {},
      disabled: true,
    },
    {
      label: "Yıldızlı",
      icon: Star,
      path: "/starred",
      active: false,
      onClick: () => {},
      disabled: true,
    },
    {
      label: "Çöp Kutusu",
      icon: Trash2,
      path: "/trash",
      active: false,
      onClick: () => {},
      disabled: true,
    },
  ];

  return (
    <div
      className={cn(
        "w-64 flex flex-col h-full border-r bg-card/30 backdrop-blur-xl p-6 gap-6",
        className,
      )}
    >
      {/* Workspace Switcher */}
      <WorkspaceSwitcher />

      {/* New Action Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="w-full justify-start gap-2 shadow-lg shadow-primary/20 rounded-2xl h-12 text-base font-semibold"
            disabled={!canUploadFiles}
          >
            <Plus className="w-5 h-5" />
            Yeni Ekle
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 p-2 rounded-xl">
          <DropdownMenuItem
            onClick={
              isUploadBlocked ? undefined : () => openDialog("upload-files", {})
            }
            disabled={isUploadBlocked}
            className="gap-2 p-3 rounded-lg cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-blue-500" />
            <span>Dosya Yükle</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={
              isUploadBlocked
                ? undefined
                : () => openDialog("create-folder", {})
            }
            disabled={isUploadBlocked}
            className="gap-2 p-3 rounded-lg cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-yellow-500" />
            <span>Klasör Oluştur</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Navigation */}
      <div className="flex-1 space-y-1">
        <div className="text-xs font-semibold text-muted-foreground mb-4 px-2 uppercase tracking-wider">
          Menü
        </div>
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant={item.active ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 font-medium h-11 rounded-xl transition-all duration-200",
              item.active
                ? "bg-primary/10 text-primary hover:bg-primary/15 shadow-sm"
                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
            )}
            onClick={item.onClick}
            disabled={item.disabled}
          >
            <item.icon
              className={cn(
                "w-5 h-5",
                item.active ? "text-primary" : "text-muted-foreground",
              )}
            />
            {item.label}
          </Button>
        ))}
      </div>

      {/* Storage Usage */}
      <div className="mt-auto pt-6 border-t border-border/50">
        <div className="bg-muted/30 p-5 rounded-3xl border border-border/50 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <Cloud className="w-5 h-5" />
            <span className="font-semibold text-sm">Bulut Alanı</span>
          </div>

          <StorageUsage usage={userStorageUsageQuery.data} className="w-full" />

          <Button
            variant="default"
            size="sm"
            className="w-full mt-5 rounded-xl text-xs h-9 shadow-md"
          >
            Yükselt
          </Button>
        </div>
      </div>
    </div>
  );
}
