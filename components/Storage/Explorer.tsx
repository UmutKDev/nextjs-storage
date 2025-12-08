"use client";

import React from "react";
import Breadcrumb from "./Breadcrumb";
import StorageBrowser, { ViewMode } from "./StorageBrowser";
import EmptyState from "./EmptyState";
import SearchBar from "./SearchBar";
import type {
  CloudDirectoryModel,
  CloudObjectModel,
  CloudBreadCrumbModel,
  CloudUserStorageUsageResponseModel,
  CloudBreadCrumbListModelResult,
  CloudObjectListModelResult,
  CloudDirectoryListModelResult,
} from "@/Service/Generates/api";
import { cloudApiFactory } from "@/Service/Factories";
import { useQueryClient, UseQueryResult } from "@tanstack/react-query";
import {
  CLOUD_DIRECTORIES_QUERY_KEY,
  CLOUD_LIST_QUERY_KEY,
  createCloudObjectsQueryKey,
} from "@/hooks/useCloudList";
import { Button } from "@/components/ui/button";
import CreateFolderModal from "./CreateFolderModal";
import FileUploadModal from "./FileUploadModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import toast from "react-hot-toast";
import {
  FolderPlus,
  UploadCloudIcon,
  Trash2,
  LayoutGrid,
  List,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import StorageUsage from "./StorageUsage";
import useUserStorageUsage from "@/hooks/useUserStorageUsage";
import FilePreviewModal from "./FilePreviewModal";

export default function Explorer({
  queries: { breadcrumbQuery, objectsQuery, directoriesQuery },
  currentPath,
  invalidates,
  showCreateFolder,
  setShowCreateFolder,
  showUpload,
  setShowUpload,
}: {
  queries: {
    breadcrumbQuery: UseQueryResult<CloudBreadCrumbListModelResult, Error>;
    objectsQuery: UseQueryResult<CloudObjectListModelResult, Error>;
    directoriesQuery: UseQueryResult<CloudDirectoryListModelResult, Error>;
  };
  currentPath: string;
  invalidates: {
    invalidateBreadcrumb: () => Promise<void>;
    invalidateObjects: () => Promise<void>;
    invalidateDirectories: () => Promise<void>;
  };
  showCreateFolder: boolean;
  setShowCreateFolder: (show: boolean) => void;
  showUpload: boolean;
  setShowUpload: (show: boolean) => void;
}) {
  // main data hook
  const { invalidate: invalidateUsage } = useUserStorageUsage();

  // UI state
  const [search, setSearch] = React.useState("");
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [previewFile, setPreviewFile] = React.useState<CloudObjectModel | null>(
    null
  );
  const prevPath = React.useRef(currentPath);

  // create folder UI state
  const [newFolderName, setNewFolderName] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  // delete UI state
  const [deleting, setDeleting] = React.useState<Record<string, boolean>>({});
  const [toDelete, setToDelete] = React.useState<
    CloudObjectModel | CloudDirectoryModel | null
  >(null);
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(
    new Set()
  );

  const qc = useQueryClient();

  const contents = objectsQuery.data?.items ?? [];
  const directories = directoriesQuery.data?.items ?? [];

  // Filter logic
  const filteredContents = React.useMemo(() => {
    if (!search) return contents;
    return contents.filter((c) =>
      c.Name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [contents, search]);

  const filteredDirectories = React.useMemo(() => {
    if (!search) return directories;
    return directories.filter((d) => {
      // CloudDirectoryModel only has Prefix, not Name
      const prefix = d.Prefix ?? "";
      const segments = prefix.split("/").filter(Boolean);
      const name = segments.length ? segments[segments.length - 1] : prefix;
      return name.toLowerCase().includes(search.toLowerCase());
    });
  }, [directories, search]);

  // Clear selection when path changes
  React.useEffect(() => {
    setSelectedItems(new Set());
  }, [currentPath]);

  const handleMove = async (sourceKey: string, destinationKey: string) => {
    try {
      await cloudApiFactory.move({
        cloudMoveRequestModel: {
          SourceKey: sourceKey,
          DestinationKey: destinationKey,
        },
      });
      toast.success("Moved successfully");
      await Promise.all([
        invalidates.invalidateObjects(),
        invalidates.invalidateDirectories(),
      ]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to move item");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) return;

    if (
      !confirm(`Are you sure you want to delete ${selectedItems.size} items?`)
    )
      return;

    try {
      const selectedFiles = contents.filter(
        (c) => c.Path?.Key && selectedItems.has(c.Path.Key)
      );
      const selectedDirs = directories.filter(
        (d) => d.Prefix && selectedItems.has(d.Prefix)
      );

      if (selectedFiles.length > 0) {
        await cloudApiFactory._delete({
          cloudDeleteRequestModel: {
            Key: selectedFiles.map((f) => f.Path!.Key!),
            IsDirectory: false,
          },
        });
      }

      if (selectedDirs.length > 0) {
        await cloudApiFactory._delete({
          cloudDeleteRequestModel: {
            Key: selectedDirs.map((d) => d.Prefix!),
            IsDirectory: true,
          },
        });
      }

      toast.success("Deleted selected items");
      setSelectedItems(new Set());
      await Promise.all([
        invalidates.invalidateObjects(),
        invalidates.invalidateDirectories(),
        invalidateUsage(),
      ]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete items");
    }
  };

  async function performDelete(item: CloudObjectModel | CloudDirectoryModel) {
    const isDirectory = "Prefix" in item;
    const key = isDirectory
      ? (item as CloudDirectoryModel).Prefix
      : (item as CloudObjectModel).Path?.Key;

    if (!key) return;

    setDeleting((prev) => ({ ...prev, [key]: true }));
    try {
      await cloudApiFactory._delete({
        cloudDeleteRequestModel: { Key: [key], IsDirectory: isDirectory },
      });
      toast.success("Deleted successfully");
      await Promise.all([
        invalidates.invalidateObjects(),
        invalidates.invalidateDirectories(),
        invalidateUsage(),
      ]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete");
    } finally {
      setDeleting((prev) => ({ ...prev, [key]: false }));
      setToDelete(null);
    }
  }

  // Helper to get name for delete modal
  const getItemName = (item: CloudObjectModel | CloudDirectoryModel) => {
    if ("Prefix" in item) {
      const prefix = item.Prefix ?? "";
      const segments = prefix.split("/").filter(Boolean);
      return segments.length ? segments[segments.length - 1] : prefix;
    }
    return item.Name;
  };

  // When path changes set navigating state so panels immediately show loading
  React.useEffect(() => {
    if (prevPath.current !== currentPath) {
      prevPath.current = currentPath;
      setIsNavigating(true);
    }
  }, [currentPath]);

  // When fetch completes, clear navigating state (small debounce to avoid flicker)
  React.useEffect(() => {
    if (!objectsQuery.isFetching && !directoriesQuery.isFetching) {
      const t = setTimeout(() => setIsNavigating(false), 120);
      return () => clearTimeout(t);
    }
    return;
  }, [objectsQuery.isFetching, directoriesQuery.isFetching]);

  async function createFolder() {
    const name = newFolderName.trim();
    if (!name) {
      toast.error("Folder name required");
      return;
    }
    if (name.includes("/")) {
      toast.error("Folder name cannot contain '/'");
      return;
    }

    setCreating(true);
    try {
      // build key with trailing slash
      const prefix = currentPath
        ? currentPath.endsWith("/")
          ? currentPath
          : `${currentPath}/`
        : "";
      const key = `${prefix}${name}/`;

      await cloudApiFactory.createDirectory({
        cloudKeyRequestModel: { Key: key },
      });

      // invalidate relevant queries so UI refreshes
      await Promise.all([invalidates.invalidateDirectories()]);

      toast.success("Folder created");
      setShowCreateFolder(false);
      setNewFolderName("");
    } catch (e) {
      console.error(e);
      toast.error("Failed to create folder");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm shrink-0 gap-4">
        <div className="flex-1 min-w-0">
          <Breadcrumb
            items={breadcrumbQuery.data?.result ?? []}
            currentPath={currentPath}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {selectedItems.size > 0 && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDeleteSelected}
              className="shrink-0"
            >
              <Trash2 size={16} className="mr-2" />
              <span className="hidden sm:inline">
                Delete ({selectedItems.size})
              </span>
            </Button>
          )}

          <SearchBar value={search} onChange={setSearch} />

          <div className="hidden sm:flex items-center gap-1 border-l pl-2 ml-2">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List size={16} />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid size={16} />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-y-auto p-4">
          <StorageBrowser
            directories={filteredDirectories}
            contents={filteredContents}
            onPreview={(file) => setPreviewFile(file)}
            loading={isNavigating || objectsQuery.isFetching}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onDelete={(item) => setToDelete(item)}
            deleting={deleting}
            selectedItems={selectedItems}
            onSelect={(items) => setSelectedItems(items)}
            onMove={handleMove}
          />

          {objectsQuery.isSuccess &&
          directoriesQuery.isSuccess &&
          !objectsQuery.isFetching &&
          !directoriesQuery.isFetching &&
          !isNavigating &&
          !search &&
          contents.length === 0 &&
          directories.length === 0 ? (
            <div className="h-full grid place-items-center">
              <EmptyState
                title="Klasör Boş"
                description="Bu klasörde henüz dosya veya klasör yok."
              />
            </div>
          ) : null}
        </div>
      </div>

      <CreateFolderModal
        open={showCreateFolder}
        onOpenChange={setShowCreateFolder}
        onCreate={createFolder}
        loading={creating}
        folderName={newFolderName}
        setFolderName={setNewFolderName}
      />

      <FileUploadModal
        open={showUpload}
        onOpenChange={setShowUpload}
        currentPath={currentPath}
        onUploadComplete={() => {
          invalidates.invalidateObjects();
          invalidateUsage();
        }}
      />

      <ConfirmDeleteModal
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        onConfirm={() => toDelete && performDelete(toDelete)}
        title={`Delete ${toDelete ? getItemName(toDelete) : ""}?`}
        description="This action cannot be undone."
      />

      <FilePreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}
