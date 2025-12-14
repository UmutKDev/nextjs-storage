"use client";

import React from "react";
import Breadcrumb from "./Breadcrumb";
import StorageBrowser, { ViewMode } from "./StorageBrowser";
import EmptyState from "./EmptyState";
import SearchBar from "./SearchBar";
import type {
  CloudDirectoryModel,
  CloudObjectModel,
  CloudBreadCrumbListModelResult,
  CloudObjectListModelResult,
  CloudDirectoryListModelResult,
} from "@/Service/Generates/api";
import { cloudApiFactory } from "@/Service/Factories";
import { UseQueryResult } from "@tanstack/react-query";
import {} from "@/hooks/useCloudList";
import { Button } from "@/components/ui/button";
import CreateFolderModal from "./CreateFolderModal";
import MoveFileModal from "./MoveFileModal";
import FileUploadModal from "./FileUploadModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import toast from "react-hot-toast";
import {
  Trash2,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Folder,
  FolderInput,
} from "lucide-react";
import {} from "@/components/ui/card";

import useUserStorageUsage from "@/hooks/useUserStorageUsage";
import FilePreviewModal from "./FilePreviewModal";
import FileIcon from "./FileIcon";

import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";

export default function Explorer({
  queries: { breadcrumbQuery, objectsQuery, directoriesQuery },
  currentPath,
  invalidates,
  orderByField,
  orderByDirection,
  setOrderByField,
  setOrderByDirection,
  showCreateFolder,
  setShowCreateFolder,
  showUpload,
  setShowUpload,
  page,
  setPage,
  pageSize,
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
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  orderByField?: string | undefined;
  orderByDirection?: "asc" | "desc" | undefined;
  setOrderByField?: (f?: string) => void;
  setOrderByDirection?: (d?: "asc" | "desc") => void;
}) {
  // main data hook
  const { invalidate: invalidateUsage } = useUserStorageUsage();

  // UI state
  const [search, setSearch] = React.useState("");
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");
  const [showMoveModal, setShowMoveModal] = React.useState(false);
  const [moveSourceKeys, setMoveSourceKeys] = React.useState<string[]>([]);
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

  // DnD state
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const contents = React.useMemo(
    () => objectsQuery.data?.items ?? [],
    [objectsQuery.data?.items]
  );
  const directories = React.useMemo(
    () => directoriesQuery.data?.items ?? [],
    [directoriesQuery.data?.items]
  );

  const activeItem = React.useMemo(() => {
    if (!activeId) return null;
    const dir = directories.find((d) => d.Prefix === activeId);
    if (dir) return { type: "folder" as const, data: dir };
    const file = contents.find((c) => c.Path?.Key === activeId);
    if (file) return { type: "file" as const, data: file };
    return null;
  }, [activeId, directories, contents]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Pagination logic
  const totalFiles = objectsQuery.data?.options?.count ?? 0;
  const totalDirs = directoriesQuery.data?.options?.count ?? 0;
  const totalItems = Math.max(totalFiles, totalDirs);
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

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

  const handleMove = async (sourceKeys: string[], destinationKey: string) => {
    try {
      await cloudApiFactory.move({
        cloudMoveRequestModel: {
          SourceKeys: sourceKeys,
          DestinationKey: destinationKey === "" ? "/" : destinationKey,
        },
      });
      toast.success("Moved successfully");
      setSelectedItems(new Set());
      await Promise.all([
        invalidates.invalidateObjects(),
        invalidates.invalidateDirectories(),
      ]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to move item");
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const sourceId = active.id as string;
    const targetId = over.id as string;

    if (sourceId === targetId) return;

    // Determine destination path
    // If dropped on a folder in the list, targetId is the folder prefix (e.g. "A/B/")
    // If dropped on a breadcrumb, targetId is the path (e.g. "A" or "")

    // We need to construct the full destination key: destinationFolder + filename

    // Get filename from source
    // sourceId is the full key (e.g. "A/file.txt") or folder prefix ("A/B/")
    // If it's a folder, we are moving a folder.

    const sourceData = active.data.current;
    const isSourceFolder = sourceData?.type === "folder";

    // // Extract name
    // let name = "";
    // if (isSourceFolder) {
    //   const segments = sourceId.split("/").filter(Boolean);
    //   name = segments[segments.length - 1];
    // } else {
    //   const segments = sourceId.split("/");
    //   name = segments[segments.length - 1];
    // }

    // Determine target folder path
    // If target is root, path is empty string.
    // If target is "A/B/", path is "A/B/".
    // Breadcrumb root has id "".

    let targetFolder = targetId.replace(/^\/+/, "");
    if (targetFolder && !targetFolder.endsWith("/")) {
      targetFolder += "/";
    }

    // Check if we are dropping into the same folder
    let currentParent = "";
    if (isSourceFolder) {
      // sourceId is "A/B/"
      const noSlash = sourceId.slice(0, -1);
      const lastSlash = noSlash.lastIndexOf("/");
      currentParent =
        lastSlash === -1 ? "" : noSlash.substring(0, lastSlash + 1);
    } else {
      const lastSlash = sourceId.lastIndexOf("/");
      currentParent =
        lastSlash === -1 ? "" : sourceId.substring(0, lastSlash + 1);
    }

    if (currentParent === targetFolder) return;

    // For move operation, DestinationKey should be the target directory
    const destinationKey = targetFolder === "" ? "/" : targetFolder;

    handleMove([sourceId], destinationKey);
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

  const handleSelectAll = () => {
    const allKeys = new Set<string>();
    filteredDirectories.forEach((d) => {
      if (d.Prefix) allKeys.add(d.Prefix);
    });
    filteredContents.forEach((c) => {
      if (c.Path?.Key) allKeys.add(c.Path.Key);
    });
    setSelectedItems(allKeys);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm shrink-0 gap-4">
          <div className="flex-1 min-w-0">
            <Breadcrumb items={breadcrumbQuery.data?.items ?? []} />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {selectedItems.size > 0 && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSelectAll}
                  className="shrink-0"
                >
                  Select All
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setMoveSourceKeys(Array.from(selectedItems));
                    setShowMoveModal(true);
                  }}
                  className="shrink-0"
                >
                  <FolderInput size={16} className="mr-2" />
                  <span className="hidden sm:inline">
                    Move ({selectedItems.size})
                  </span>
                </Button>
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
              </>
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
              loading={isNavigating || objectsQuery.isLoading}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onDelete={(item) => setToDelete(item)}
              deleting={deleting}
              selectedItems={selectedItems}
              onSelect={(items) => setSelectedItems(items)}
              onMove={(src, dest) => handleMove([src], dest)}
              onMoveClick={(items) => {
                setMoveSourceKeys(items);
                setShowMoveModal(true);
              }}
              setPage={setPage}
            />

            {objectsQuery.isSuccess &&
            directoriesQuery.isSuccess &&
            !objectsQuery.isLoading &&
            !directoriesQuery.isLoading &&
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

        {/* Pagination Footer */}
        <div className="p-4 border-t bg-card/50 backdrop-blur-sm flex items-center justify-between shrink-0">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        <MoveFileModal
          open={showMoveModal}
          onClose={() => setShowMoveModal(false)}
          sourceKeys={moveSourceKeys}
          onMove={handleMove}
          initialPath={currentPath}
        />

        <CreateFolderModal
          open={showCreateFolder}
          onClose={() => setShowCreateFolder(false)}
          onSubmit={createFolder}
          loading={creating}
          value={newFolderName}
          onChange={setNewFolderName}
        />

        <FileUploadModal
          open={showUpload}
          onClose={() => setShowUpload(false)}
        />

        <ConfirmDeleteModal
          open={!!toDelete}
          onOpenChange={(open) => {
            if (!open) setToDelete(null);
          }}
          onConfirm={async () => {
            if (toDelete) await performDelete(toDelete);
          }}
          title={`Delete ${toDelete ? getItemName(toDelete) : ""}?`}
          description="This action cannot be undone."
        />

        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          files={filteredContents}
          onChange={setPreviewFile}
        />

        <DragOverlay dropAnimation={null}>
          {activeItem ? (
            <div className="opacity-90 pointer-events-none w-64">
              <div className="px-4 py-3 bg-card border rounded-md shadow-xl flex items-center gap-3">
                {activeItem.type === "folder" ? (
                  <div className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
                    <Folder
                      size={18}
                      fill="currentColor"
                      className="opacity-80"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center rounded-md bg-muted/20">
                    <FileIcon extension={activeItem.data.Extension} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {activeItem.type === "folder"
                      ? activeItem.data.Name
                      : activeItem.data.Metadata?.Originalfilename ||
                        activeItem.data.Name}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
