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
import {
  useQueryClient,
  UseInfiniteQueryResult,
  UseQueryResult,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  CLOUD_DIRECTORIES_QUERY_KEY,
  CLOUD_OBJECTS_QUERY_KEY,
} from "@/hooks/useCloudList";
import { Button } from "@/components/ui/button";
import CreateFolderModal from "./CreateFolderModal";
import CreateEncryptedFolderModal from "./CreateEncryptedFolderModal";
import ConvertToEncryptedModal from "./ConvertToEncryptedModal";
import MoveFileModal from "./MoveFileModal";
import FileUploadModal from "./FileUploadModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import ConfirmMoveDragModal from "./ConfirmMoveDragModal";
import RenameFolderModal from "./RenameFolderModal";
import toast from "react-hot-toast";
import {
  Trash2,
  LayoutGrid,
  List,
  Folder,
  FolderInput,
  Lock,
  Loader2,
  Archive,
  UploadCloud,
} from "lucide-react";

import useUserStorageUsage from "@/hooks/useUserStorageUsage";
import FilePreviewModal from "./FilePreviewModal";
import FileIcon from "./FileIcon";
import { useEncryptedFolders } from "./EncryptedFoldersProvider";
import { isAxiosError } from "axios";
import { useStorage } from "./StorageProvider";
import { createIdempotencyKey } from "@/lib/idempotency";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Progress } from "@/components/ui/progress";

import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  pointerWithin,
  DragEndEvent,
  DragStartEvent,
  Modifier,
} from "@dnd-kit/core";

const snapToCursor: Modifier = ({
  transform,
  activatorEvent,
  draggingNodeRect,
}) => {
  if (draggingNodeRect && activatorEvent) {
    const activator = activatorEvent as unknown as MouseEvent;
    if ("clientX" in activator) {
      const offsetX = activator.clientX - draggingNodeRect.left;
      const offsetY = activator.clientY - draggingNodeRect.top;

      return {
        ...transform,
        x: transform.x + offsetX - draggingNodeRect.width / 2,
        y: transform.y + offsetY - draggingNodeRect.height / 2,
      };
    }
  }

  return transform;
};

const normalizeFolderPath = (path?: string | null) => {
  if (!path) return "";
  return path.replace(/^\/+|\/+$/g, "");
};

const getFolderNameFromPrefix = (prefix?: string | null) => {
  if (!prefix) return "";
  const segments = prefix.split("/").filter(Boolean);
  return segments.length ? segments[segments.length - 1] : prefix;
};

export default function Explorer({
  queries: { breadcrumbQuery, objectsQuery, directoriesQuery },
  currentPath,
  invalidates,
  showCreateFolder,
  setShowCreateFolder,
  showUpload,
  setShowUpload,
  onOpenMobileSidebar,
}: {
  queries: {
    breadcrumbQuery: UseQueryResult<CloudBreadCrumbListModelResult, Error>;
    objectsQuery: UseInfiniteQueryResult<
      InfiniteData<CloudObjectListModelResult, number>,
      Error
    >;
    directoriesQuery: UseInfiniteQueryResult<
      InfiniteData<CloudDirectoryListModelResult, number>,
      Error
    >;
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
  onOpenMobileSidebar?: () => void;
}) {
  const { setIsCurrentLocked } = useStorage();
  const queryClient = useQueryClient();
  // main data hook
  const { invalidateBreadcrumb, invalidateObjects, invalidateDirectories } =
    invalidates;
  const { invalidate: invalidateUsage, userStorageUsageQuery } =
    useUserStorageUsage();
  const {
    isFolderEncrypted,
    isFolderEncryptedExact,
    isFolderUnlocked,
    promptUnlock,
    getSessionToken,
    getFolderPassphrase,
    registerEncryptedPath,
    refetchManifest,
  } = useEncryptedFolders();

  // UI state
  const [search, setSearch] = React.useState("");
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");
  const [showMoveModal, setShowMoveModal] = React.useState(false);
  const [moveSourceKeys, setMoveSourceKeys] = React.useState<string[]>([]);
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [previewFile, setPreviewFile] = React.useState<CloudObjectModel | null>(
    null
  );
  const { handleFiles, uploads } = useFileUpload(currentPath);
  const maxUploadBytes = userStorageUsageQuery.data?.MaxUploadSizeBytes;
  const [isFileDragging, setIsFileDragging] = React.useState(false);
  const fileDragDepth = React.useRef(0);
  const prevPath = React.useRef(currentPath);
  const hasPromptedUnlock = React.useRef<Set<string>>(new Set());
  const folderLabel =
    currentPath.split("/").filter(Boolean).pop() || "bu klasör";

  // Check if current view is locked based on 403 errors or provider state
  const accessDeniedState = React.useMemo(() => {
    const dirError = directoriesQuery.error;
    const objError = objectsQuery.error;

    const error =
      (isAxiosError(dirError) && dirError.response?.status === 403
        ? dirError
        : null) ||
      (isAxiosError(objError) && objError.response?.status === 403
        ? objError
        : null);

    if (!error) return null;

    let path = currentPath;
    const data = error.response?.data;
    if (data?.message && typeof data.message === "string") {
      const match = data.message.match(/Folder "(.*?)" is encrypted/);
      if (match && match[1]) {
        path = match[1];
      }
    }

    return { path };
  }, [directoriesQuery.error, objectsQuery.error, currentPath]);

  // If we found an encrypted parent via 403, register it immediately and prompt unlock
  const accessDeniedPath = accessDeniedState?.path;
  React.useEffect(() => {
    if (!accessDeniedPath) {
      console.log("[Explorer] No access denied path");
      return;
    }

    console.log("[Explorer] Access denied for path:", accessDeniedPath);
    registerEncryptedPath(accessDeniedPath);

    // Only prompt once per path during this session
    if (hasPromptedUnlock.current.has(accessDeniedPath)) {
      console.log("[Explorer] Already prompted for:", accessDeniedPath);
      return;
    }

    console.log("[Explorer] Prompting unlock for:", accessDeniedPath);
    hasPromptedUnlock.current.add(accessDeniedPath);

    // Automatically prompt for unlock when we detect 403
    const folderName =
      getFolderNameFromPrefix(accessDeniedPath) ||
      accessDeniedPath.split("/").filter(Boolean).pop() ||
      "şifreli klasör";

    // Use setTimeout to ensure prompt happens after render
    const timer = setTimeout(() => {
      console.log("[Explorer] Opening unlock modal for:", accessDeniedPath);
      promptUnlock({
        path: accessDeniedPath,
        label: folderName,
        force: true, // Force prompt even if we think it's unlocked
        onSuccess: async () => {
          console.log("[Explorer] Successfully unlocked:", accessDeniedPath);
          // Manually reset errors to ensure UI updates immediately
          // While invalidateQueries eventually works, resetting ensures "error" state is cleared faster
          await Promise.all([
            queryClient.resetQueries({ queryKey: CLOUD_DIRECTORIES_QUERY_KEY }),
            queryClient.resetQueries({ queryKey: CLOUD_OBJECTS_QUERY_KEY }),
          ]);
          // Also strict invalidate to fetch fresh data
          await Promise.all([invalidateDirectories(), invalidateObjects()]);
        },
      });
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessDeniedPath]); // Only depend on the path, other functions are stable

  const isAccessDenied = !!accessDeniedState;
  const lockPath = accessDeniedState?.path || currentPath;

  const isCurrentEncrypted =
    isFolderEncrypted(currentPath) ||
    isFolderEncrypted(lockPath) ||
    isAccessDenied;
  const isCurrentLocked =
    isAccessDenied || (isCurrentEncrypted && !isFolderUnlocked(lockPath));

  React.useEffect(() => {
    setIsCurrentLocked(isCurrentLocked);
  }, [isCurrentLocked, setIsCurrentLocked]);

  React.useEffect(() => {
    if (isCurrentLocked && showCreateFolder) {
      setShowCreateFolder(false);
      toast.error("Sifrelenmis klasor kilitli. Klasor olusturamazsiniz.");
    }
  }, [isCurrentLocked, showCreateFolder, setShowCreateFolder]);

  // create folder UI state
  const [newFolderName, setNewFolderName] = React.useState("");
  const [newFolderEncrypted, setNewFolderEncrypted] = React.useState(false);
  const [newFolderPassphrase, setNewFolderPassphrase] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  // Deprecated separate encrypted state but kept to avoid breaking removal of modal if needed later
  const [encryptedFolderName, setEncryptedFolderName] = React.useState("");
  const [encryptedPassphrase, setEncryptedPassphrase] = React.useState("");
  const [creatingEncrypted, setCreatingEncrypted] = React.useState(false);
  const [renameTarget, setRenameTarget] =
    React.useState<CloudDirectoryModel | null>(null);
  const [renameValue, setRenameValue] = React.useState("");
  const [convertTarget, setConvertTarget] =
    React.useState<CloudDirectoryModel | null>(null);
  const [convertPassphrase, setConvertPassphrase] = React.useState("");
  const [converting, setConverting] = React.useState(false);
  const [renaming, setRenaming] = React.useState(false);
  const renameNormalizedPath = renameTarget
    ? normalizeFolderPath(renameTarget.Prefix)
    : "";
  const renameIsEncrypted = Boolean(
    renameTarget &&
      renameNormalizedPath &&
      (isFolderEncryptedExact(renameNormalizedPath) || renameTarget.IsEncrypted)
  );
  const renameCurrentName = renameTarget
    ? getFolderNameFromPrefix(renameTarget.Prefix)
    : "";

  // delete UI state
  const [deleting, setDeleting] = React.useState<Record<string, boolean>>({});
  const [toDelete, setToDelete] = React.useState<
    CloudObjectModel | CloudDirectoryModel | null
  >(null);
  const [toExtract, setToExtract] = React.useState<CloudObjectModel | null>(
    null
  );
  const [extractJobs, setExtractJobs] = React.useState<
    Record<
      string,
      {
        key: string;
        jobId?: string;
        state: string;
        progress?: {
          entriesProcessed?: number;
          totalEntries?: number | null;
          bytesRead?: number;
          totalBytes?: number | null;
          currentEntry?: string;
        };
        extractedPath?: string;
        failedReason?: string;
        updatedAt: number;
      }
    >
  >({});
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(
    new Set()
  );

  // DnD state
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [dragMoveData, setDragMoveData] = React.useState<{
    sourceIds: string[];
    targetKey: string;
    sourceName?: string;
    targetName?: string;
  } | null>(null);

  const contents = React.useMemo(() => {
    const all =
      objectsQuery.data?.pages?.flatMap((page) => page?.items ?? []) ?? [];
    const seen = new Set<string>();
    return all.filter((item) => {
      const key = item.Path?.Key;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [objectsQuery.data]);

  const directories = React.useMemo(() => {
    const all =
      directoriesQuery.data?.pages?.flatMap((page) => page?.items ?? []) ?? [];
    const seen = new Set<string>();
    return all.filter((item) => {
      const key = item.Prefix;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [directoriesQuery.data]);

  // Register encrypted paths
  React.useEffect(() => {
    directories.forEach((d) => {
      if (d.IsEncrypted && d.Prefix) {
        registerEncryptedPath(d.Prefix);
      }
    });
  }, [directories, registerEncryptedPath]);

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
        distance: 15,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const totalFiles = React.useMemo(() => {
    const pages = objectsQuery.data?.pages ?? [];
    if (pages.length === 0) return 0;
    return pages[pages.length - 1]?.options?.count ?? 0;
  }, [objectsQuery.data]);

  const totalDirs = React.useMemo(() => {
    const pages = directoriesQuery.data?.pages ?? [];
    if (pages.length === 0) return 0;
    return pages[pages.length - 1]?.options?.count ?? 0;
  }, [directoriesQuery.data]);

  const loadedCount = contents.length + directories.length;
  const totalItems = (totalFiles || 0) + (totalDirs || 0);

  const hasMoreObjects = objectsQuery.hasNextPage ?? false;
  const hasMoreDirectories = directoriesQuery.hasNextPage ?? false;
  const canLoadMore = hasMoreObjects || hasMoreDirectories;
  const isFetchingMore =
    objectsQuery.isFetchingNextPage || directoriesQuery.isFetchingNextPage;

  const {
    fetchNextPage: fetchNextObjects,
    isFetchingNextPage: fetchingNextObjects,
  } = objectsQuery;
  const {
    fetchNextPage: fetchNextDirectories,
    isFetchingNextPage: fetchingNextDirectories,
  } = directoriesQuery;

  const loadMoreRef = React.useRef<HTMLDivElement | null>(null);
  const loadMore = React.useCallback(() => {
    if (!canLoadMore) return;
    if (hasMoreDirectories && !fetchingNextDirectories) {
      void fetchNextDirectories();
    }
    if (hasMoreObjects && !fetchingNextObjects) {
      void fetchNextObjects();
    }
  }, [
    canLoadMore,
    fetchNextDirectories,
    fetchNextObjects,
    fetchingNextDirectories,
    fetchingNextObjects,
    hasMoreDirectories,
    hasMoreObjects,
  ]);

  React.useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  const humanFileSize = React.useCallback((bytes?: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
  }, []);

  const isFileDragEvent = (event: React.DragEvent) =>
    Array.from(event.dataTransfer.types || []).includes("Files");

  const handleFileDragEnter = (event: React.DragEvent) => {
    if (!isFileDragEvent(event)) return;
    event.preventDefault();
    event.stopPropagation();
    fileDragDepth.current += 1;
    setIsFileDragging(true);
  };

  const handleFileDragLeave = (event: React.DragEvent) => {
    if (!isFileDragEvent(event)) return;
    event.preventDefault();
    event.stopPropagation();
    fileDragDepth.current -= 1;
    if (fileDragDepth.current <= 0) {
      fileDragDepth.current = 0;
      setIsFileDragging(false);
    }
  };

  const handleFileDragOver = (event: React.DragEvent) => {
    if (!isFileDragEvent(event)) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleFileDrop = (event: React.DragEvent) => {
    if (!isFileDragEvent(event)) return;
    event.preventDefault();
    event.stopPropagation();
    fileDragDepth.current = 0;
    setIsFileDragging(false);

    const droppedFiles = event.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;
    const files = Array.from(droppedFiles);
    if (typeof maxUploadBytes === "number") {
      const allowed: File[] = [];
      const rejected: File[] = [];
      files.forEach((f) => {
        if (f.size <= maxUploadBytes) allowed.push(f);
        else rejected.push(f);
      });
      if (rejected.length > 0) {
        toast.error(
          `${rejected.length} dosya çok büyük. Maksimum ${humanFileSize(
            maxUploadBytes
          )}.`
        );
      }
      if (allowed.length > 0) handleFiles(allowed);
    } else {
      handleFiles(files);
    }
  };

  const activeUploads = React.useMemo(
    () => uploads.filter((u) => u.status === "uploading"),
    [uploads]
  );

  const activeUploadProgress = React.useMemo(() => {
    if (activeUploads.length === 0) return 0;
    const total = activeUploads.reduce((sum, item) => sum + item.progress, 0);
    return Math.round(total / activeUploads.length);
  }, [activeUploads]);

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
    // Clear the prompted unlock set when path changes so user can be prompted again for new paths
    hasPromptedUnlock.current.clear();
  }, [currentPath]);

  const handleMove = async (
    sourceKeys: string[],
    destinationKey: string,
    options?: { skipUnlockPrompt?: boolean }
  ): Promise<boolean> => {
    const normalizedDestination = normalizeFolderPath(
      destinationKey === "/" ? "" : destinationKey
    );
    const destinationEncrypted =
      normalizedDestination && isFolderEncrypted(normalizedDestination);
    const destinationUnlocked = destinationEncrypted
      ? isFolderUnlocked(normalizedDestination)
      : true;

    if (
      destinationEncrypted &&
      !destinationUnlocked &&
      !options?.skipUnlockPrompt &&
      normalizedDestination
    ) {
      const destinationLabel =
        getFolderNameFromPrefix(destinationKey) ||
        normalizedDestination ||
        "şifreli klasör";
      promptUnlock({
        path: normalizedDestination,
        label: destinationLabel,
        onSuccess: () => {
          void handleMove(sourceKeys, destinationKey, {
            skipUnlockPrompt: true,
          });
        },
      });
      return false;
    }

    try {
      let moveSessionToken = getSessionToken(destinationKey);
      if (!moveSessionToken) {
        for (const key of sourceKeys) {
          moveSessionToken = getSessionToken(key);
          if (moveSessionToken) break;
        }
      }
      const moveOptions = moveSessionToken
        ? { headers: { "x-folder-session": moveSessionToken } }
        : undefined;

      await cloudApiFactory.move(
        {
          idempotencyKey: createIdempotencyKey(),
          cloudMoveRequestModel: {
            SourceKeys: sourceKeys,
            DestinationKey: destinationKey === "" ? "/" : destinationKey,
          },
        },
        moveOptions
      );
      toast.success("Moved successfully");
      setSelectedItems(new Set());
      await Promise.all([invalidateObjects(), invalidateDirectories()]);
      return true;
    } catch (e) {
      console.error(e);
      toast.error("Failed to move item");
      return false;
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

    const sourceData = active.data.current;
    const isSourceFolder = sourceData?.type === "folder";

    let targetFolder = targetId.replace(/^\/+/, "");
    if (targetFolder && !targetFolder.endsWith("/")) {
      targetFolder += "/";
    }

    let currentParent = "";
    if (isSourceFolder) {
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

    const destinationKey = targetFolder === "" ? "/" : targetFolder;

    // handleMove([sourceId], destinationKey);
    setDragMoveData({
      sourceIds: [sourceId],
      targetKey: destinationKey,
      sourceName: isSourceFolder
        ? getFolderNameFromPrefix(sourceId)
        : sourceId.split("/").pop(),
      targetName:
        targetFolder === "" || targetFolder === "/"
          ? "Ana Dizin"
          : getFolderNameFromPrefix(targetFolder),
    });
  };

  const handleDeleteSelected = async ({
    skipConfirm = false,
  }: {
    skipConfirm?: boolean;
  } = {}) => {
    if (selectedItems.size === 0) return;

    if (
      !skipConfirm &&
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

      const encryptedDirs: CloudDirectoryModel[] = [];
      const regularDirs: CloudDirectoryModel[] = [];
      selectedDirs.forEach((dir) => {
        const normalizedPath = normalizeFolderPath(dir.Prefix);
        if (normalizedPath && isFolderEncrypted(normalizedPath)) {
          encryptedDirs.push(dir);
        } else if (dir.IsEncrypted) {
          encryptedDirs.push(dir);
        } else {
          regularDirs.push(dir);
        }
      });

      if (encryptedDirs.length > 0) {
        const missing = encryptedDirs.find((dir) => {
          const normalizedPath = normalizeFolderPath(dir.Prefix);
          if (!normalizedPath) return true;
          return !getFolderPassphrase(normalizedPath);
        });

        if (missing) {
          const normalizedPath = normalizeFolderPath(missing.Prefix);
          if (normalizedPath) {
            promptUnlock({
              path: normalizedPath,
              label: getItemName(missing),
              onSuccess: () => {
                handleDeleteSelected({ skipConfirm: true });
              },
            });
          }
          return;
        }
      }

      if (selectedFiles.length > 0 || regularDirs.length > 0) {
        const bulkDeleteSession = getSessionToken(currentPath);
        const bulkDeleteOptions = bulkDeleteSession
          ? { headers: { "x-folder-session": bulkDeleteSession } }
          : undefined;
        await cloudApiFactory._delete(
          {
            idempotencyKey: createIdempotencyKey(),
            cloudDeleteRequestModel: {
              Items: [
                ...selectedFiles.map((f) => ({
                  Key: f.Path!.Key!,
                  IsDirectory: false,
                })),
                ...regularDirs.map((d) => ({
                  Key: d.Prefix!,
                  IsDirectory: true,
                })),
              ],
            },
          },
          bulkDeleteOptions
        );
      }

      if (encryptedDirs.length > 0) {
        await Promise.all(
          encryptedDirs.map(async (dir) => {
            const normalizedPath = normalizeFolderPath(dir.Prefix);
            if (!normalizedPath) return;
            const passphrase = getFolderPassphrase(normalizedPath);
            const sessionToken = getSessionToken(normalizedPath);
            await cloudApiFactory.directoryDelete({
              directoryDeleteRequestModel: {
                Path: normalizedPath,
              },
              xFolderPassphrase: passphrase,
              xFolderSession: sessionToken || undefined,
            });
          })
        );
      }

      toast.success("Deleted selected items");
      setSelectedItems(new Set());
      await Promise.all([
        invalidateObjects(),
        invalidateDirectories(),
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
      const deleteSessionToken = getSessionToken(key);
      const deleteOptions = deleteSessionToken
        ? { headers: { "x-folder-session": deleteSessionToken } }
        : undefined;
      if (isDirectory) {
        const dir = item as CloudDirectoryModel;
        const normalizedPath = normalizeFolderPath(dir.Prefix);
        const encryptedPath =
          normalizedPath && isFolderEncrypted(normalizedPath);
        const shouldTreatAsEncrypted = Boolean(
          encryptedPath || (dir.IsEncrypted && normalizedPath)
        );

        if (shouldTreatAsEncrypted && normalizedPath) {
          const passphrase = getFolderPassphrase(normalizedPath);
          if (!passphrase) {
            setDeleting((prev) => ({ ...prev, [key]: false }));
            promptUnlock({
              path: normalizedPath,
              label: getItemName(item),
              onSuccess: () => {
                void performDelete(item);
              },
            });
            return;
          }
          await cloudApiFactory.directoryDelete({
            directoryDeleteRequestModel: {
              Path: normalizedPath,
            },
            xFolderPassphrase: passphrase,
            xFolderSession: getSessionToken(normalizedPath) || undefined,
          });
        } else {
          await cloudApiFactory._delete(
            {
              idempotencyKey: createIdempotencyKey(),
              cloudDeleteRequestModel: {
                Items: [{ Key: key, IsDirectory: true }],
              },
            },
            deleteOptions
          );
        }
      } else {
        await cloudApiFactory._delete(
          {
            idempotencyKey: createIdempotencyKey(),
            cloudDeleteRequestModel: {
              Items: [{ Key: key, IsDirectory: isDirectory }],
            },
          },
          deleteOptions
        );
      }
      toast.success("Deleted successfully");
      await Promise.all([
        invalidateObjects(),
        invalidateDirectories(),
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

  const normalizePath = (path?: string | null) => {
    if (!path) return "";
    return path.replace(/^\/+|\/+$/g, "");
  };

  const getParentPath = (key: string) => {
    const trimmed = key.replace(/^\/+/, "");
    const lastSlash = trimmed.lastIndexOf("/");
    if (lastSlash === -1) return "";
    return trimmed.slice(0, lastSlash);
  };

  const invalidatePath = React.useCallback(
    async (path: string) => {
      const normalized = normalizePath(path);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: CLOUD_OBJECTS_QUERY_KEY,
          predicate: (q) =>
            Array.isArray(q.queryKey) &&
            q.queryKey[0] === CLOUD_OBJECTS_QUERY_KEY[0] &&
            q.queryKey[1] === CLOUD_OBJECTS_QUERY_KEY[1] &&
            q.queryKey[2] === normalized,
        }),
        queryClient.invalidateQueries({
          queryKey: CLOUD_DIRECTORIES_QUERY_KEY,
          predicate: (q) =>
            Array.isArray(q.queryKey) &&
            q.queryKey[0] === CLOUD_DIRECTORIES_QUERY_KEY[0] &&
            q.queryKey[1] === CLOUD_DIRECTORIES_QUERY_KEY[1] &&
            q.queryKey[2] === normalized,
        }),
      ]);
    },
    [queryClient]
  );

  const scheduleJobCleanup = React.useCallback((key: string) => {
    setTimeout(() => {
      setExtractJobs((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 10000);
  }, []);

  const updateExtractJob = React.useCallback(
    (
      key: string,
      update: Partial<{
        jobId: string;
        state: string;
        progress: {
          entriesProcessed?: number;
          totalEntries?: number | null;
          bytesRead?: number;
          totalBytes?: number | null;
          currentEntry?: string;
        };
        extractedPath?: string;
        failedReason?: string;
      }>
    ) => {
      setExtractJobs((prev) => {
        const existing = prev[key];
        if (!existing) {
          return {
            ...prev,
            [key]: {
              key,
              state: update.state ?? "waiting",
              jobId: update.jobId,
              progress: update.progress,
              extractedPath: update.extractedPath,
              failedReason: update.failedReason,
              updatedAt: Date.now(),
            },
          };
        }
        return {
          ...prev,
          [key]: {
            ...existing,
            ...update,
            updatedAt: Date.now(),
          },
        };
      });
    },
    []
  );

  const pollExtractStatus = React.useCallback(
    async (key: string, jobId: string) => {
      try {
        const response = await cloudApiFactory.extractZipStatus({ jobId });
        const result = response.data?.result;
        if (!result) return;

        const progress = (result.Progress || {}) as {
          entriesProcessed?: number;
          totalEntries?: number | null;
          bytesRead?: number;
          totalBytes?: number | null;
          currentEntry?: string;
        };

        updateExtractJob(key, {
          state: result.State,
          progress,
          extractedPath: result.ExtractedPath,
          failedReason: result.FailedReason,
        });

        if (result.State === "completed") {
          const extractedPath = result.ExtractedPath;
          const parentPath = getParentPath(key);
          if (extractedPath) {
            await Promise.all([
              invalidatePath(parentPath),
              invalidatePath(extractedPath),
            ]);
          } else {
            await invalidatePath(parentPath);
          }
          scheduleJobCleanup(key);
          toast.success("Zip çıkarma tamamlandı");
        }

        if (result.State === "failed") {
          const reason = result.FailedReason || "Zip çıkarılamadı";
          toast.error(reason);
          scheduleJobCleanup(key);
        }

        if (result.State === "cancelled") {
          toast.success("Zip çıkarma iptal edildi");
          scheduleJobCleanup(key);
        }
      } catch (e) {
        console.error(e);
      }
    },
    [invalidatePath, scheduleJobCleanup, updateExtractJob]
  );

  React.useEffect(() => {
    const pollStates = new Set(["active", "waiting", "delayed", "starting"]);
    const jobsToPoll = Object.values(extractJobs).filter(
      (job) => job.jobId && pollStates.has(job.state)
    );

    if (jobsToPoll.length === 0) return;

    jobsToPoll.forEach((job) => {
      if (job.jobId) void pollExtractStatus(job.key, job.jobId);
    });

    const interval = setInterval(() => {
      jobsToPoll.forEach((job) => {
        if (job.jobId) void pollExtractStatus(job.key, job.jobId);
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [extractJobs, pollExtractStatus]);

  async function handleExtractZip(file: CloudObjectModel) {
    const key = file.Path?.Key;
    if (!key) {
      toast.error("Zip key missing");
      return;
    }

    updateExtractJob(key, { state: "starting" });

    try {
      const sessionToken = getSessionToken(key);
      const sessionOptions = sessionToken
        ? { headers: { "x-folder-session": sessionToken } }
        : undefined;
      const response = await cloudApiFactory.extractZipStart({
        cloudExtractZipStartRequestModel: { Key: key },
      }, sessionOptions);
      const jobId = response.data?.result?.JobId;
      if (!jobId) {
        toast.error("Extract jobId missing");
        updateExtractJob(key, { state: "failed" });
        scheduleJobCleanup(key);
        return;
      }
      updateExtractJob(key, { jobId, state: "waiting" });
      await pollExtractStatus(key, jobId);
    } catch (e) {
      console.error(e);
      toast.error("Zip çıkarma başlatılamadı");
      updateExtractJob(key, { state: "failed" });
      scheduleJobCleanup(key);
    }
  }

  async function handleCancelExtractZip(file: CloudObjectModel) {
    const key = file.Path?.Key;
    if (!key) return;
    const job = extractJobs[key];
    if (!job?.jobId) return;

    try {
      await cloudApiFactory.extractZipCancel({
        cloudExtractZipCancelRequestModel: { JobId: job.jobId },
      });
      updateExtractJob(key, { state: "cancelled" });
      scheduleJobCleanup(key);
      toast.success("Zip çıkarma iptal edildi");
    } catch (e) {
      console.error(e);
      toast.error("Zip çıkarma iptal edilemedi");
    }
  }

  function getItemName(item: CloudObjectModel | CloudDirectoryModel) {
    if ("Prefix" in item) {
      const prefix = item.Prefix ?? "";
      const segments = prefix.split("/").filter(Boolean);
      return segments.length ? segments[segments.length - 1] : prefix;
    }
    return item.Name;
  }

  function getFileDisplayName(item: CloudObjectModel) {
    return item.Metadata?.Originalfilename || item.Name || "dosya";
  }

  React.useEffect(() => {
    if (prevPath.current !== currentPath) {
      prevPath.current = currentPath;
      setIsNavigating(true);
    }
  }, [currentPath]);

  React.useEffect(() => {
    if (!objectsQuery.isFetching && !directoriesQuery.isFetching) {
      const t = setTimeout(() => setIsNavigating(false), 120);
      return () => clearTimeout(t);
    }
    return;
  }, [objectsQuery.isFetching, directoriesQuery.isFetching]);

  async function createFolder() {
    if (isCurrentLocked) {
      toast.error("Sifrelenmis klasor kilitli. Klasor olusturamazsiniz.");
      return;
    }
    const name = newFolderName.trim();
    if (!name) {
      toast.error("Folder name required");
      return;
    }
    if (name.includes("/")) {
      toast.error("Folder name cannot contain '/'");
      return;
    }

    if (newFolderEncrypted) {
      if (newFolderPassphrase.length < 8) {
        toast.error("Parola en az 8 karakter olmalı");
        return;
      }
    }

    setCreating(true);
    try {
      const prefix = currentPath
        ? currentPath.endsWith("/")
          ? currentPath
          : `${currentPath}/`
        : "";
      const sessionToken = getSessionToken(currentPath);

      if (newFolderEncrypted) {
        const path = `${prefix}${name}`.replace(/\/+/g, "/").replace(/\/$/, "");
        await cloudApiFactory.directoryCreate({
          directoryCreateRequestModel: { Path: path, IsEncrypted: true },
          xFolderPassphrase: newFolderPassphrase,
          xFolderSession: sessionToken || undefined,
        });
        await refetchManifest();
      } else {
        const key = `${prefix}${name}/`;
        // Updated to use directoryCreate
        await cloudApiFactory.directoryCreate({
          directoryCreateRequestModel: { Path: key, IsEncrypted: false },
          xFolderSession: sessionToken || undefined,
        });
      }

      await Promise.all([invalidateDirectories()]);

      toast.success(
        newFolderEncrypted ? "Şifreli klasör oluşturuldu" : "Folder created"
      );
      setShowCreateFolder(false);
      setNewFolderName("");
      setNewFolderEncrypted(false);
      setNewFolderPassphrase("");
    } catch (e) {
      console.error(e);
      if (isAxiosError(e) && e.response?.status === 409) {
        toast.error("Bu isimde klasör zaten var");
      } else {
        toast.error("Failed to create folder");
      }
    } finally {
      setCreating(false);
    }
  }

  async function createEncryptedFolder() {
    if (isCurrentLocked) {
      toast.error("Sifrelenmis klasor kilitli. Klasor olusturamazsiniz.");
      return;
    }
    const name = encryptedFolderName.trim();
    if (!name) {
      toast.error("Klasör adı gerekli");
      return;
    }
    if (name.includes("/")) {
      toast.error("Klasör adı '/' içeremez");
      return;
    }

    const passphrase = encryptedPassphrase.trim();
    if (passphrase.length < 8) {
      toast.error("Parola en az 8 karakter olmalı");
      return;
    }

    setCreatingEncrypted(true);
    try {
      const prefix = currentPath ? `${currentPath}/` : "";
      const path = `${prefix}${name}`.replace(/\/+/g, "/").replace(/\/$/, "");
      const sessionToken = getSessionToken(currentPath);

      // Updated to use directoryCreate with passphrase
      await cloudApiFactory.directoryCreate({
        directoryCreateRequestModel: {
          Path: path,
          IsEncrypted: true,
        },
        xFolderPassphrase: passphrase,
        xFolderSession: sessionToken || undefined,
      });

      toast.success("Şifreli klasör oluşturuldu");
      setShowCreateFolder(false);
      setEncryptedFolderName("");
      setEncryptedPassphrase("");
      await Promise.all([invalidateDirectories(), refetchManifest()]);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        toast.error("Bu isimde şifreli klasör zaten var");
      } else {
        toast.error("Şifreli klasör oluşturulamadı");
      }
    } finally {
      setCreatingEncrypted(false);
    }
  }

  const closeConvertModal = React.useCallback(() => {
    setConvertTarget(null);
    setConvertPassphrase("");
  }, []);

  const handleConvertRequest = React.useCallback(
    (dir: CloudDirectoryModel) => {
      const normalizedPath = normalizeFolderPath(dir.Prefix);
      if (!normalizedPath) {
        toast.error("Klasör yolu bulunamadı");
        return;
      }
      if (isFolderEncrypted(normalizedPath) || dir.IsEncrypted) {
        toast.error("Bu klasör zaten şifreli");
        return;
      }
      setConvertTarget(dir);
      setConvertPassphrase("");
    },
    [isFolderEncrypted]
  );

  const handleConvertSubmit = React.useCallback(async () => {
    if (!convertTarget) return;
    const normalizedPath = normalizeFolderPath(convertTarget.Prefix);
    if (!normalizedPath) {
      toast.error("Klasör yolu bulunamadı");
      return;
    }
    const passphrase = convertPassphrase.trim();
    if (passphrase.length < 8) {
      toast.error("Parola en az 8 karakter olmalı");
      return;
    }

    setConverting(true);
    try {
      // Updated to use directoryConvertToEncrypted
      await cloudApiFactory.directoryConvertToEncrypted({
        directoryConvertToEncryptedRequestModel: {
          Path: normalizedPath,
        },
        xFolderPassphrase: passphrase,
        xFolderSession: getSessionToken(normalizedPath) || undefined,
      });
      toast.success("Klasör şifreli hale getirildi");
      closeConvertModal();
      await Promise.all([
        invalidateDirectories(),
        invalidateObjects(),
        refetchManifest(),
      ]);
    } catch (error) {
      console.error(error);
      if (isAxiosError(error) && error.response?.status === 409) {
        toast.error("Klasör zaten şifreli görünüyor");
      } else {
        toast.error("Klasör şifrelenemedi");
      }
    } finally {
      setConverting(false);
    }
  }, [
    closeConvertModal,
    convertPassphrase,
    convertTarget,
    invalidateDirectories,
    invalidateObjects,
    refetchManifest,
  ]);

  const closeRenameModal = React.useCallback(() => {
    setRenameTarget(null);
    setRenameValue("");
  }, []);

  const handleRenameRequest = React.useCallback((dir: CloudDirectoryModel) => {
    setRenameTarget(dir);
    setRenameValue(getFolderNameFromPrefix(dir.Prefix));
  }, []);

  const renameFolder = React.useCallback(
    async (
      dir: CloudDirectoryModel,
      newName: string,
      passphraseOverride?: string
    ) => {
      const prefix = dir.Prefix ?? "";
      const normalizedPath = normalizeFolderPath(prefix);
      const folderDisplayName =
        getFolderNameFromPrefix(prefix) || dir.Name || "bu klasör";
      const isEncryptedTarget = Boolean(
        normalizedPath &&
          (isFolderEncryptedExact(normalizedPath) || dir.IsEncrypted)
      );

      const executeRename = async (passphrase?: string) => {
        setRenaming(true);
        try {
          if (isEncryptedTarget) {
            if (!normalizedPath) {
              throw new Error("Klasör yolu bulunamadı");
            }
            if (!passphrase) {
              throw new Error("Klasör için parola gerekli");
            }
            // Updated to use directoryRename
            await cloudApiFactory.directoryRename({
              directoryRenameRequestModel: {
                Path: normalizedPath,
                Name: newName,
              },
              xFolderPassphrase: passphrase,
              xFolderSession: getSessionToken(normalizedPath) || undefined,
            });
            await refetchManifest();
          } else {
            // Unencrypted also uses directoryRename now if supported,
            // but cloudApiFactory.renameDirectory (deprecated) might be what was used.
            // Migration says: 	PUT /Cloud/Directories/Rename
            // So we use directoryRename for both.

            // Wait, normalizedPath is path. api expects Path of directory, and Name.
            // Standard directory rename also uses directoryRename now.

            if (!normalizedPath) throw new Error("Invalid path");

            await cloudApiFactory.directoryRename({
              directoryRenameRequestModel: {
                Path: normalizedPath,
                Name: newName,
              },
              xFolderSession: getSessionToken(normalizedPath) || undefined,
            });
          }

          toast.success("Klasör yeniden adlandırıldı");
          setRenameTarget(null);
          setRenameValue("");
          await Promise.all([
            invalidateDirectories(),
            invalidateObjects(),
            invalidateBreadcrumb(),
          ]);
        } catch (error) {
          console.error(error);
          toast.error("Klasör yeniden adlandırılamadı");
        } finally {
          setRenaming(false);
        }
      };

      if (isEncryptedTarget) {
        if (!normalizedPath) {
          toast.error("Klasör yolu bulunamadı");
          return;
        }
        const passphrase =
          passphraseOverride ?? getFolderPassphrase(normalizedPath);
        if (!passphrase) {
          promptUnlock({
            path: normalizedPath,
            label: folderDisplayName,
            onSuccess: (token) => {
              // We need passphrase for rename, not token.
              // But promptUnlock's onSuccess gives token (and previously passphrase).
              // I removed passphrase from onSuccess signature in provider!
              // I should check if I can get passphrase via getFolderPassphrase after unlock.
              // Yes, unlockFolder updates passesphrases state.
              const p = getFolderPassphrase(normalizedPath);
              if (p) {
                void renameFolder(dir, newName, p);
              }
            },
          });
          return;
        }
        await executeRename(passphrase);
        return;
      }

      await executeRename();
    },
    [
      getFolderPassphrase,
      invalidateBreadcrumb,
      invalidateDirectories,
      invalidateObjects,
      isFolderEncrypted,
      isFolderEncryptedExact,
      promptUnlock,
      refetchManifest,
    ]
  );

  const handleRenameConfirm = React.useCallback(async () => {
    if (!renameTarget) return;
    const trimmed = renameValue.trim();
    if (!trimmed) {
      toast.error("Klasör adı gerekli");
      return;
    }
    if (trimmed.includes("/")) {
      toast.error("Klasör adı '/' içeremez");
      return;
    }

    const currentName = getFolderNameFromPrefix(renameTarget.Prefix);
    if (currentName === trimmed) {
      closeRenameModal();
      return;
    }

    await renameFolder(renameTarget, trimmed);
  }, [closeRenameModal, renameFolder, renameTarget, renameValue]);

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
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 border-b bg-card/50 backdrop-blur-sm shrink-0 gap-3 md:gap-4 box-border">
          <div className="flex items-center gap-2 w-full md:w-auto min-w-0">
            {/* Mobile Sidebar Trigger */}
            <Button
              variant="outline"
              size="icon"
              className="md:hidden shrink-0 h-8 w-8"
              onClick={onOpenMobileSidebar}
            >
              <LayoutGrid size={16} />
            </Button>

            <div className="flex-1 min-w-0 overflow-hidden">
              <Breadcrumb items={breadcrumbQuery.data?.items ?? []} />
            </div>

            {/* Mobile View Toggle */}
            <div className="flex md:hidden items-center border-l pl-2 ml-1 shrink-0">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  setViewMode(viewMode === "list" ? "grid" : "list")
                }
              >
                {viewMode === "list" ? (
                  <List size={16} />
                ) : (
                  <LayoutGrid size={16} />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {selectedItems.size > 0 ? (
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSelectAll}
                  className="shrink-0 whitespace-nowrap"
                >
                  <span className="md:hidden">Tümü</span>
                  <span className="hidden md:inline">Tümünü Seç</span>
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setMoveSourceKeys(Array.from(selectedItems));
                    setShowMoveModal(true);
                  }}
                  className="shrink-0 whitespace-nowrap"
                >
                  <FolderInput size={16} className="mr-2" />
                  <span className="hidden sm:inline">
                    Taşı ({selectedItems.size})
                  </span>
                  <span className="sm:hidden">Taşı</span>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => void handleDeleteSelected()}
                  className="shrink-0 whitespace-nowrap"
                >
                  <Trash2 size={16} className="mr-2" />
                  <span className="hidden sm:inline">
                    Sil ({selectedItems.size})
                  </span>
                  <span className="sm:hidden">Sil</span>
                </Button>
              </div>
            ) : (
              <div className="w-full md:w-auto">
                <SearchBar value={search} onChange={setSearch} />
              </div>
            )}

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

        <div
          className="flex-1 overflow-hidden relative"
          onDragEnter={handleFileDragEnter}
          onDragLeave={handleFileDragLeave}
          onDragOver={handleFileDragOver}
          onDrop={handleFileDrop}
        >
          {isFileDragging ? (
            <div className="absolute inset-0 z-20 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-background/75 via-background/60 to-background/80 backdrop-blur-md" />
              <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px]" />
              <div className="relative z-10 h-full flex items-center justify-center">
                <div className="relative mx-6 w-full max-w-[520px]">
                  <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-r from-foreground/12 via-transparent to-foreground/12 blur-2xl" />
                  <div className="relative overflow-hidden rounded-[28px] border border-foreground/10 bg-card/80 shadow-2xl backdrop-blur-xl">
                    <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-foreground/5 to-transparent" />
                    <div className="relative px-8 py-10 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-foreground/10 bg-background/70 shadow-sm">
                        <UploadCloud className="h-6 w-6 text-foreground" />
                      </div>
                      <div className="mt-5 text-base font-semibold tracking-wide text-foreground">
                        Dosyaları buraya bırakın
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Yükleme otomatik olarak başlar
                      </div>
                      <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
                      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground/80">
                        Hazır
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {activeUploads.length > 0 ? (
            <div className="absolute left-1/2 top-4 z-30 w-[min(92vw,440px)] -translate-x-1/2 rounded-2xl border border-border/70 bg-card/95 px-4 py-3 shadow-xl backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60">
                    <UploadCloud className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      Yukleme devam ediyor
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {activeUploads.length} dosya
                    </span>
                  </div>
                </div>
                <span className="rounded-full border border-border/70 bg-background/60 px-2.5 py-1 text-xs font-medium tabular-nums text-foreground">
                  {activeUploadProgress}%
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
                  <span>Toplam ilerleme</span>
                  <span>{activeUploadProgress}%</span>
                </div>
                <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-muted/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-foreground/30 via-foreground/70 to-foreground/30 transition-[width] duration-200"
                    style={{ width: `${activeUploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : null}
          <div className="absolute inset-0 overflow-y-auto p-4">
            {isCurrentLocked ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-5 px-4 py-10">
                <div className="w-14 h-14 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-2 max-w-md">
                  <div className="text-lg font-semibold text-foreground">
                    Şifrelenmiş klasör kilitli
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {folderLabel} şifrelenmiş durumda. İçeriği görüntülemek için
                    parolayı girerek bu klasörü kilitsiz hale getirin.
                  </p>
                </div>
                <Button
                  onClick={() =>
                    promptUnlock({
                      path: lockPath,
                      label: getFolderNameFromPrefix(lockPath) || folderLabel,
                      force: true,
                    })
                  }
                  size="sm"
                >
                  Klasörü Kilitsiz Yap
                </Button>
              </div>
            ) : (
              <>
                <StorageBrowser
                  directories={filteredDirectories}
                  contents={filteredContents}
                  onPreview={(file) => setPreviewFile(file)}
                  loading={
                    !isAccessDenied &&
                    (isNavigating ||
                      objectsQuery.isLoading ||
                      directoriesQuery.isLoading)
                  }
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  onDelete={(item) => setToDelete(item)}
                  deleting={deleting}
                  extractJobs={extractJobs}
                  selectedItems={selectedItems}
                  onSelect={(items) => setSelectedItems(items)}
                  onMove={(src, dest) => handleMove([src], dest)}
                  onMoveClick={(items) => {
                    setMoveSourceKeys(items);
                    setShowMoveModal(true);
                  }}
                  onRenameFolder={handleRenameRequest}
                  onConvertFolder={handleConvertRequest}
                  onExtractZip={(file) => setToExtract(file)}
                  onCancelExtractZip={(file) => void handleCancelExtractZip(file)}
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

                <div ref={loadMoreRef} className="h-12 w-full" />
                {isFetchingMore ? (
                  <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Daha fazlası yükleniyor...
                  </div>
                ) : canLoadMore ? (
                  <div className="flex items-center justify-center py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadMore()}
                    >
                      Daha fazla getir
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>

        {/* Infinite load status */}
        <div className="p-4 border-t bg-card/50 backdrop-blur-sm flex items-center justify-between shrink-0">
          <div className="text-sm text-muted-foreground">
            {loadedCount > 0
              ? `Yüklenen: ${loadedCount}${
                  totalItems ? ` / ${totalItems}` : ""
                }`
              : "Henüz içerik yok"}
          </div>
          <div className="flex items-center gap-2">
            {isFetchingMore && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadMore()}
              disabled={!canLoadMore || isFetchingMore}
            >
              {canLoadMore ? "Daha Fazla Yükle" : "Tümü yüklendi"}
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
          onClose={() => {
            setShowCreateFolder(false);
            setNewFolderEncrypted(false);
            setNewFolderPassphrase("");
          }}
          onSubmit={createFolder}
          loading={creating}
          value={newFolderName}
          onChange={setNewFolderName}
          isEncrypted={newFolderEncrypted}
          onIsEncryptedChange={setNewFolderEncrypted}
          passphrase={newFolderPassphrase}
          onPassphraseChange={setNewFolderPassphrase}
        />
        {/* Deprecated legacy encrypted modal
        <CreateEncryptedFolderModal
          open={showCreateEncryptedFolder}
          onClose={() => setShowCreateEncryptedFolder(false)}
          folderName={encryptedFolderName}
          onFolderNameChange={setEncryptedFolderName}
          passphrase={encryptedPassphrase}
          onPassphraseChange={setEncryptedPassphrase}
          onSubmit={createEncryptedFolder}
          loading={creatingEncrypted}
        /> 
        */}
        <ConvertToEncryptedModal
          open={Boolean(convertTarget)}
          onClose={closeConvertModal}
          folderName={
            convertTarget ? getFolderNameFromPrefix(convertTarget.Prefix) : ""
          }
          passphrase={convertPassphrase}
          onPassphraseChange={setConvertPassphrase}
          onSubmit={() => void handleConvertSubmit()}
          loading={converting}
        />
        <RenameFolderModal
          open={Boolean(renameTarget)}
          onClose={closeRenameModal}
          value={renameValue}
          onChange={setRenameValue}
          onSubmit={() => void handleRenameConfirm()}
          loading={renaming}
          currentName={renameCurrentName}
          isEncrypted={renameIsEncrypted}
        />

        <FileUploadModal
          open={showUpload}
          onClose={() => setShowUpload(false)}
        />

        <ConfirmMoveDragModal
          open={!!dragMoveData}
          onOpenChange={(open) => !open && setDragMoveData(null)}
          title={`Taşı: ${dragMoveData?.sourceName}`}
          description={`"${dragMoveData?.sourceName}" öğesini "${dragMoveData?.targetName}" klasörüne taşımak istediğinizden emin misiniz?`}
          onConfirm={async () => {
            if (dragMoveData) {
              await handleMove(dragMoveData.sourceIds, dragMoveData.targetKey);
              setDragMoveData(null);
            }
          }}
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

        <ConfirmDeleteModal
          open={!!toExtract}
          onOpenChange={(open) => {
            if (!open) setToExtract(null);
          }}
          onConfirm={async () => {
            if (toExtract) await handleExtractZip(toExtract);
          }}
          title={`Zip cikarilsin mi: ${toExtract ? getFileDisplayName(toExtract) : ""}?`}
          description="Bu islem zip dosyasindan yeni bir klasor olusturur."
          headerLabel="Extract zip"
          confirmLabel="Extract"
          confirmVariant="primary"
          icon={<Archive className="text-primary" />}
          note={null}
        />

        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          files={filteredContents}
          onChange={setPreviewFile}
          onDelete={(file) => {
            setPreviewFile(null);
            setToDelete(file);
          }}
        />

        <DragOverlay dropAnimation={null} modifiers={[snapToCursor]}>
          {activeItem ? (
            <div className="opacity-90 pointer-events-none w-64 cursor-grabbing">
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
