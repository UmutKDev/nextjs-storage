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
} from "@/hooks/useCloudList";
import { Button } from "@/components/ui/button";
import CreateFolderModal from "./CreateFolderModal";
import FileUploadModal from "./FileUploadModal";
import toast from "react-hot-toast";
import { FolderPlus, UploadCloudIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import StorageUsage from "./StorageUsage";
import useUserStorageUsage from "@/hooks/useUserStorageUsage";
import FilePreviewModal from "./FilePreviewModal";

export default function Explorer({
  queries: { breadcrumbQuery, objectsQuery, directoriesQuery },
  currentPath,
  invalidates,
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
}) {
  // main data hook

  // UI state
  const [search, setSearch] = React.useState("");
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [previewFile, setPreviewFile] = React.useState<CloudObjectModel | null>(
    null
  );
  const prevPath = React.useRef(currentPath);

  // create folder UI state
  const [showCreate, setShowCreate] = React.useState(false);
  const [showUpload, setShowUpload] = React.useState(false);
  const [newFolderName, setNewFolderName] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const qc = useQueryClient();

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

      toast.success(`Folder created: ${key}`);
      setNewFolderName("");
      setShowCreate(false);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to create folder: ${String(e)}`);
    } finally {
      setCreating(false);
    }
  }

  // Don't hide the whole page while loading — keep cards visible and render
  // per-card placeholders (skeletons). This keeps layout stable when navigating
  // into a folder or refreshing the page.
  const usageQuery = useUserStorageUsage();
  const usage = usageQuery.userStorageUsageQuery.data;
  const directories: CloudDirectoryModel[] = directoriesQuery.data?.items ?? [];
  const contents: CloudObjectModel[] = objectsQuery.data?.items ?? [];

  // simple case-insensitive matches
  const searchLower = search.toLowerCase();
  const filteredDirectories = directories.filter((d: CloudDirectoryModel) => {
    const seg = (d?.Prefix ?? "").split("/").filter(Boolean).slice(-1)[0] ?? "";
    return seg.toLowerCase().includes(searchLower);
  });

  const filteredContents = contents.filter((c: CloudObjectModel) => {
    const name = (c?.Name ?? "") + "." + (c?.Extension ?? "");
    return name.toLowerCase().includes(searchLower);
  });

  const breadcrumbs: CloudBreadCrumbModel[] = breadcrumbQuery.data?.items ?? [];

  // compute concise loading flags used throughout the UI
  // - Query can be 'loading' for initial load or 'fetching' for background refresh
  // - isNavigating indicates a local transition between paths (shows panel skeletons)
  const directoriesLoading =
    directoriesQuery.isFetching || directoriesQuery.isLoading || isNavigating;

  const contentsLoading =
    objectsQuery.isFetching || objectsQuery.isLoading || isNavigating;

  return (
    // make explorer take full height of its parent card and use flex so header
    // is fixed-height and panels stretch to fill remaining space
    <div className="space-y-6 h-full flex flex-col">
      {/* increased spacing between header and panels */}
      <Card>
        <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-2 md:py-2 px-4 md:px-6">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground">Storage</div>
            <div className="mt-2">
              <Breadcrumb
                items={breadcrumbs.map((b: CloudBreadCrumbModel) => ({
                  Name: b.Name,
                  Path: b.Path,
                  Type: b.Type,
                }))}
              />
              {/* compact mobile usage */}
            </div>
          </div>

          <div className="mt-4 md:mt-0 md:ml-6 w-full md:w-1/2 flex items-center gap-3">
            {usage ? (
              <StorageUsage
                usage={usage}
                className="hidden md:flex md:items-center md:ml-4"
              />
            ) : null}

            <div className="flex-1">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            {/* usage block shown on md+ to the right of search */}
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="border-b py-4">
          <div className="flex items-center justify-between gap-3 w-full">
            <CardTitle>Explorer</CardTitle>
            <div className="shrink-0 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCreate(true)}
              >
                <FolderPlus size={14} />
                <span className="ml-2 hidden sm:inline">New Folder</span>
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={() => setShowUpload(true)}
              >
                <UploadCloudIcon size={14} />
                <span className="ml-2 hidden sm:inline">Upload</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <div className="h-full overflow-auto p-4">
            <CreateFolderModal
              open={showCreate}
              onClose={() => setShowCreate(false)}
              value={newFolderName}
              onChange={setNewFolderName}
              loading={creating}
              onSubmit={createFolder}
            />
            <FileUploadModal
              open={showUpload}
              onClose={() => setShowUpload(false)}
            />

            <StorageBrowser
              directories={search ? filteredDirectories : directories}
              contents={search ? filteredContents : contents}
              onPreview={setPreviewFile}
              loading={directoriesLoading || contentsLoading}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
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
                  title="Empty Folder"
                  description="This folder is empty."
                />
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* file preview modal - rendered when a file is selected */}
      {previewFile ? (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          onChange={setPreviewFile}
          files={search ? filteredContents : contents}
        />
      ) : null}
    </div>
  );
}
