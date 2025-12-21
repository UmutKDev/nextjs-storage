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
  CloudEncryptedFolderDeleteRequestModel,
} from "@/Service/Generates/api";
import { cloudApiFactory } from "@/Service/Factories";
import {
  UseInfiniteQueryResult,
  UseQueryResult,
  type InfiniteData,
} from "@tanstack/react-query";
import {} from "@/hooks/useCloudList";
import { Button } from "@/components/ui/button";
import CreateFolderModal from "./CreateFolderModal";
import CreateEncryptedFolderModal from "./CreateEncryptedFolderModal";
import ConvertToEncryptedModal from "./ConvertToEncryptedModal";
import MoveFileModal from "./MoveFileModal";
import FileUploadModal from "./FileUploadModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
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
} from "lucide-react";
import {} from "@/components/ui/card";

import useUserStorageUsage from "@/hooks/useUserStorageUsage";
import FilePreviewModal from "./FilePreviewModal";
import FileIcon from "./FileIcon";
import { useEncryptedFolders } from "./EncryptedFoldersProvider";
import { isAxiosError } from "axios";

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

const normalizeFolderPath = (path?: string | null) => {
  if (!path) return "";
  return path.replace(/^\/+|\/+$/g, "");
};

const getFolderNameFromPrefix = (prefix?: string | null) => {
  if (!prefix) return "";
  const segments = prefix.split("/").filter(Boolean);
  return segments.length ? segments[segments.length - 1] : prefix;
};

type EncryptedDeleteRequest = CloudEncryptedFolderDeleteRequestModel & {
  Passphrase: string;
};
export default function Explorer({
  queries: { breadcrumbQuery, objectsQuery, directoriesQuery },
  currentPath,
  invalidates,
  showCreateFolder,
  setShowCreateFolder,
  showCreateEncryptedFolder,
  setShowCreateEncryptedFolder,
  showUpload,
  setShowUpload,
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
  showCreateEncryptedFolder: boolean;
  setShowCreateEncryptedFolder: (show: boolean) => void;
  showUpload: boolean;
  setShowUpload: (show: boolean) => void;
}) {
  // main data hook
  const { invalidateBreadcrumb, invalidateObjects, invalidateDirectories } =
    invalidates;
  const { invalidate: invalidateUsage } = useUserStorageUsage();
  const {
    isFolderEncrypted,
    isFolderUnlocked,
    promptUnlock,
    refetchManifest,
    getFolderPassphrase,
    manifestLoading,
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
  const prevPath = React.useRef(currentPath);
  const folderLabel =
    currentPath.split("/").filter(Boolean).pop() || "bu klasör";
  const isCurrentEncrypted = isFolderEncrypted(currentPath);
  const isCurrentLocked = isCurrentEncrypted && !isFolderUnlocked(currentPath);

  // create folder UI state
  const [newFolderName, setNewFolderName] = React.useState("");
  const [creating, setCreating] = React.useState(false);
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
      (isFolderEncrypted(renameNormalizedPath) || renameTarget.IsEncrypted)
  );
  const renameCurrentName = renameTarget
    ? getFolderNameFromPrefix(renameTarget.Prefix)
    : "";

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
    () => objectsQuery.data?.pages?.flatMap((page) => page?.items ?? []) ?? [],
    [objectsQuery.data]
  );
  const directories = React.useMemo(
    () =>
      directoriesQuery.data?.pages?.flatMap((page) => page?.items ?? []) ?? [],
    [directoriesQuery.data]
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
  const totalItems = Math.max(totalFiles, totalDirs, loadedCount);

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
      await cloudApiFactory.move({
        cloudMoveRequestModel: {
          SourceKeys: sourceKeys,
          DestinationKey: destinationKey === "" ? "/" : destinationKey,
        },
      });
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
          // fallback for api-provided flag
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
        await cloudApiFactory._delete({
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
        });
      }

      if (encryptedDirs.length > 0) {
        await Promise.all(
          encryptedDirs.map(async (dir) => {
            const normalizedPath = normalizeFolderPath(dir.Prefix);
            if (!normalizedPath) return;
            const passphrase = getFolderPassphrase(normalizedPath);
            if (!passphrase) return;
            await cloudApiFactory.deleteEncryptedFolder({
              cloudEncryptedFolderDeleteRequestModel: {
                Path: normalizedPath,
                ShouldDeleteContents: true,
                Passphrase: passphrase,
              } as EncryptedDeleteRequest,
            });
          })
        );
        await refetchManifest();
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
          await cloudApiFactory.deleteEncryptedFolder({
            cloudEncryptedFolderDeleteRequestModel: {
              Path: normalizedPath,
              ShouldDeleteContents: true,
              Passphrase: passphrase,
            } as EncryptedDeleteRequest,
          });
          await refetchManifest();
        } else {
          await cloudApiFactory._delete({
            cloudDeleteRequestModel: {
              Items: [{ Key: key, IsDirectory: true }],
            },
          });
        }
      } else {
        await cloudApiFactory._delete({
          cloudDeleteRequestModel: {
            Items: [{ Key: key, IsDirectory: isDirectory }],
          },
        });
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

  // Helper to get name for delete modal
  function getItemName(item: CloudObjectModel | CloudDirectoryModel) {
    if ("Prefix" in item) {
      const prefix = item.Prefix ?? "";
      const segments = prefix.split("/").filter(Boolean);
      return segments.length ? segments[segments.length - 1] : prefix;
    }
    return item.Name;
  }

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
      await Promise.all([invalidateDirectories()]);

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

  async function createEncryptedFolder() {
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

      await cloudApiFactory.createEncryptedFolder({
        cloudEncryptedFolderCreateRequestModel: {
          Path: path,
          Passphrase: passphrase,
        },
      });

      toast.success("Şifreli klasör oluşturuldu");
      setShowCreateEncryptedFolder(false);
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
      await cloudApiFactory.convertFolderToEncrypted({
        cloudEncryptedFolderConvertRequestModel: {
          Path: normalizedPath,
          Passphrase: passphrase,
        },
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
        normalizedPath && (isFolderEncrypted(normalizedPath) || dir.IsEncrypted)
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
            await cloudApiFactory.renameEncryptedFolder({
              cloudEncryptedFolderRenameRequestModel: {
                Path: normalizedPath,
                Name: newName,
                Passphrase: passphrase,
              },
            });
            await refetchManifest();
          } else {
            await cloudApiFactory.renameDirectory({
              cloudRenameDirectoryRequestModel: {
                Key: prefix,
                Name: newName,
              },
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
            onSuccess: (_, unlockedPassphrase) => {
              if (unlockedPassphrase) {
                void renameFolder(dir, newName, unlockedPassphrase);
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
                  onClick={() => void handleDeleteSelected()}
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
            {manifestLoading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-center text-muted-foreground">
                <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Şifreleme durumu yükleniyor
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Lütfen klasörün güvenlik durumunu kontrol ederken bekleyin.
                  </p>
                </div>
              </div>
            ) : isCurrentLocked ? (
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
                      path: currentPath,
                      label: folderLabel,
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
                    isNavigating ||
                    objectsQuery.isLoading ||
                    directoriesQuery.isLoading
                  }
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
                  onRenameFolder={handleRenameRequest}
                  onConvertFolder={handleConvertRequest}
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
          onClose={() => setShowCreateFolder(false)}
          onSubmit={createFolder}
          loading={creating}
          value={newFolderName}
          onChange={setNewFolderName}
        />
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
