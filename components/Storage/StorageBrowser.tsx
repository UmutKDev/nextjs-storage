import React from "react";
import {
  MoreHorizontal,
  Folder,
  Trash2,
  Loader2,
  Play,
  FolderInput,
  Lock,
  Unlock,
  Pencil,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useStorage } from "./StorageProvider";
import { useEncryptedFolders } from "./EncryptedFoldersProvider";

import EditFileModal from "./EditFileModal";
import FileIcon from "./FileIcon";

import { cn } from "@/lib/utils";

import { useDraggable, useDroppable } from "@dnd-kit/core";

import type {
  CloudObjectModel,
  CloudDirectoryModel,
} from "@/Service/Generates/api";

type CloudObject = CloudObjectModel;
type Directory = CloudDirectoryModel;

export type ViewMode = "list" | "grid";

const normalizeDirectoryPath = (prefix?: string | null) => {
  if (!prefix) return "";
  return prefix.replace(/^\/+|\/+$/g, "");
};

// --- Helper Components ---

function GridThumbnail({
  file,
  onSpan,
}: {
  file: CloudObject;
  onSpan?: (span: { row: number; col: number }) => void;
}) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);
  const lastSpanRef = React.useRef<{ row: number; col: number } | null>(null);

  const url = file?.Path?.Url ?? file?.Path?.Key;
  const mime = (file?.MimeType ?? "").toLowerCase();
  const ext = (file.Extension || "").toLowerCase();

  const isImage =
    mime.startsWith("image") ||
    ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext);

  const isVideo =
    mime.startsWith("video") ||
    ["mp4", "webm", "ogg", "mov", "mkv"].includes(ext);

  const [thumb, setThumb] = React.useState<string | null>(null);
  const [thumbLoading, setThumbLoading] = React.useState(false);
  // Generate thumbnail for videos by grabbing a frame via canvas. If that fails
  // (CORS or other errors), fall back to rendering a muted <video> element.
  React.useEffect(() => {
    if (!isVideo || !url) return;
    let cancelled = false;
    setThumbLoading(true);

    async function generate() {
      try {
        const v = document.createElement("video");
        v.crossOrigin = "anonymous";
        v.preload = "metadata";
        v.src = url;

        await new Promise<void>((resolve, reject) => {
          const onLoaded = () => resolve();
          const onLoadErr = () => reject(new Error("video load error"));
          v.addEventListener("loadedmetadata", onLoaded, { once: true });
          v.addEventListener("error", onLoadErr, { once: true });
        });

        // pick a safe seek time (1s or fraction)
        const seekTo = Math.min(1, Math.max(0, (v.duration || 0) / 3));

        await new Promise<void>((resolve, reject) => {
          const onSeeked = () => resolve();
          v.currentTime = seekTo;
          v.addEventListener("seeked", onSeeked, { once: true });
          // timeout after 2s
          setTimeout(() => reject(new Error("seek timeout")), 2000);
        });

        const canvas = document.createElement("canvas");
        canvas.width = v.videoWidth || 320;
        canvas.height = v.videoHeight || 180;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no-canvas-ctx");

        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        if (!cancelled) {
          setThumb(dataUrl);
        }
      } catch (err) {
        void err;
        // ignore - fallback will render a <video> element
        // (CORS issues or other errors can make toDataURL fail)
      } finally {
        if (!cancelled) setThumbLoading(false);
      }
    }

    generate();

    return () => {
      cancelled = true;
    };
  }, [isVideo, url]);

  // non-image/video fallback
  if ((!isImage && !isVideo) || !url || error) {
    return (
      // fallback for non-image files keeps a compact placeholder that's full width
      <div className="w-full aspect-4/3 flex items-center justify-center rounded-md bg-muted/20">
        <FileIcon extension={file.Extension} />
      </div>
    );
  }

  const handleImageLoad = (img: HTMLImageElement | null) => {
    if (!img) return;
    const w = img.naturalWidth || img.width || 1;
    const h = img.naturalHeight || img.height || 1;
    const aspect = w / h;

    // Decide spans by aspect ratio
    let col = 1;
    let row = 1;

    if (aspect >= 2.4) col = 3;
    else if (aspect >= 1.6) col = 2;

    if (aspect <= 0.35) row = 3;
    else if (aspect <= 0.6) row = 2;

    const next = { row, col };
    // Only call onSpan if span changed to avoid repeated setState cycles
    if (
      !lastSpanRef.current ||
      lastSpanRef.current.col !== next.col ||
      lastSpanRef.current.row !== next.row
    ) {
      lastSpanRef.current = next;
      onSpan?.(next);
    }
  };

  const handleVideoDims = (w: number, h: number) => {
    // reuse the same sizing heuristic as images for grid spans
    const aspect = (w || 1) / (h || 1);
    let col = 1;
    let row = 1;

    if (aspect >= 2.4) col = 3;
    else if (aspect >= 1.6) col = 2;

    if (aspect <= 0.35) row = 3;
    else if (aspect <= 0.6) row = 2;

    const next = { row, col };
    if (
      !lastSpanRef.current ||
      lastSpanRef.current.col !== next.col ||
      lastSpanRef.current.row !== next.row
    ) {
      lastSpanRef.current = next;
      onSpan?.(next);
    }
  };

  return (
    <div className="w-full relative rounded-md overflow-hidden bg-muted/5">
      {/* Loading state for video thumb */}
      {(!loaded || (isVideo && thumbLoading)) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
        </div>
      )}

      {/* Image files */}
      {isImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={file.Name}
          ref={(el) => {
            if (el) handleImageLoad(el);
          }}
          // let the image flow naturally (width 100%, auto height) so tall/wide images
          // expand without being cropped to a square — avoids gaps in masonry layout
          className={`w-full h-auto object-cover transition-all duration-300 ${
            loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          loading="lazy"
        />
      )}

      {/* Video files: prefer generated thumbnail, otherwise fall back to a video element */}
      {isVideo && (
        <div className="w-full h-auto">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt={file.Name}
              onLoad={(e) => {
                setLoaded(true);
                // derive spans from the generated thumbnail
                const img = e.currentTarget as HTMLImageElement;
                handleVideoDims(
                  img.naturalWidth || img.width,
                  img.naturalHeight || img.height
                );
              }}
              className={`w-full h-auto object-cover transition-all duration-300 ${
                loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
              loading="lazy"
            />
          ) : (
            // fallback: show a muted video element (may show first frame)
            <video
              src={url}
              muted
              playsInline
              preload="metadata"
              onLoadedMetadata={(e) => {
                const t = e.currentTarget as HTMLVideoElement;
                handleVideoDims(t.videoWidth || 1, t.videoHeight || 1);
                setLoaded(true);
              }}
              className={`w-full h-auto object-cover transition-all duration-300 ${
                loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            />
          )}

          {/* play overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-10 w-10 rounded-full bg-black/40 flex items-center justify-center">
              <Play className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function humanFileSize(bytes?: number) {
  if (!bytes || bytes === 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
}

// --- Draggable Item Wrapper ---
function DraggableItem({
  id,
  type,
  children,
  className,
  selected,
  onSelect,
  onClick,
  data,
}: {
  id: string;
  type: "file" | "folder";
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
  onSelect?: (multi: boolean) => void;
  onClick?: () => void;
  data?: unknown;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { type, id, ...(data as object) },
  });

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id,
    data: { type, id, ...(data as object) },
    disabled: type === "file", // only folders can be drop targets
  });

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        setDroppableRef(node);
      }}
      {...listeners}
      {...attributes}
      className={cn(
        "relative transition-colors outline-none",
        isDragging && "opacity-30",
        isOver &&
          type === "folder" &&
          "bg-primary/10 ring-2 ring-primary ring-inset rounded-md",
        selected && "bg-muted/20 ring-1 ring-border",
        className
      )}
      onClick={() => {
        if (onSelect) {
          // e.stopPropagation();
        }
        onClick?.();
      }}
    >
      {children}
    </div>
  );
}

interface StorageBrowserProps {
  directories?: Directory[];
  contents?: CloudObject[];
  onPreview?: (file: CloudObject) => void;
  loading?: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onDelete?: (item: CloudObject | Directory) => void;
  deleting?: Record<string, boolean>;
  selectedItems: Set<string>;
  onSelect?: (items: Set<string>) => void;
  onMove?: (sourceKey: string, destinationKey: string) => void;
  onMoveClick?: (items: string[]) => void;
  onRenameFolder?: (dir: Directory) => void;
  onConvertFolder?: (dir: Directory) => void;
}

export default function StorageBrowser({
  directories,
  contents,
  onPreview,
  loading,
  viewMode,
  onDelete,
  deleting = {},
  selectedItems,
  onSelect,
  onMoveClick,
  onRenameFolder,
  onConvertFolder,
}: StorageBrowserProps) {
  const { setCurrentPath } = useStorage();
  const { promptUnlock, isFolderUnlocked, isFolderEncrypted } =
    useEncryptedFolders();
  const [toEdit, setToEdit] = React.useState<CloudObject | null>(null);

  // per-item spans (row/col) for the grid (used in grid view)
  const [spans, setSpans] = React.useState<
    Record<string, { row: number; col: number }>
  >({});

  const setSpanForKey = React.useCallback(
    (key: string, span: { row: number; col: number }) =>
      setSpans((prev) => {
        const existing = prev[key];
        // don't update state if it's identical -> prevents infinite update loops
        if (existing && existing.col === span.col && existing.row === span.row)
          return prev;

        return { ...prev, [key]: span };
      }),
    []
  );

  const getDirectoryMeta = React.useCallback(
    (dir: Directory) => {
      const normalizedPath = normalizeDirectoryPath(dir.Prefix);
      const displayName =
        dir.Name ||
        normalizedPath.split("/").filter(Boolean).pop() ||
        dir.Prefix ||
        "Klasör";
      const encrypted = Boolean(
        dir.IsEncrypted || isFolderEncrypted(normalizedPath)
      );
      const unlocked = encrypted ? isFolderUnlocked(normalizedPath) : true;
      return { normalizedPath, displayName, encrypted, unlocked };
    },
    [isFolderEncrypted, isFolderUnlocked]
  );

  const isEmpty = !directories?.length && !contents?.length && !loading;

  if (isEmpty) return null;

  // --- Handlers ---

  const handleSelect = (id: string, multi: boolean) => {
    if (!onSelect) return;
    const newSelected = new Set(multi ? selectedItems : []);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    onSelect(newSelected);
  };

  const handleItemClick = (
    item: CloudObject | Directory,
    type: "file" | "folder",
    e: React.MouseEvent
  ) => {
    const id =
      type === "file"
        ? (item as CloudObject).Path?.Key
        : (item as Directory).Prefix;
    if (!id) return;

    if (e.metaKey || e.ctrlKey) {
      handleSelect(id, true);
      return;
    }

    if (type === "folder") {
      const dir = item as Directory;
      const meta = getDirectoryMeta(dir);
      if (!meta.normalizedPath) return;

      if (meta.encrypted && !meta.unlocked) {
        promptUnlock({
          path: meta.normalizedPath,
          label: meta.displayName,
          onSuccess: () => setCurrentPath(meta.normalizedPath),
        });
        return;
      }

      if (!loading) setCurrentPath(meta.normalizedPath);
    } else {
      if (!loading && onPreview) onPreview(item as CloudObject);
    }
  };

  // --- Renderers ---

  const renderList = () => (
    <div className="divide-y rounded-md border bg-background/50">
      {/* Directories */}
      {(directories ?? []).map((d, idx) => {
        const key = d.Prefix || `dir-${idx}`;
        const meta = getDirectoryMeta(d);
        const name = meta.displayName;

        return (
          <DraggableItem
            key={key}
            id={key}
            type="folder"
            selected={selectedItems.has(key)}
            onSelect={(multi) => handleSelect(key, multi)}
            onClick={() => {}}
            className="group"
            data={d}
          >
            <div
              className="flex items-center gap-4 px-4 py-3 hover:bg-muted/10 cursor-pointer"
              onClick={(e) => handleItemClick(d, "folder", e)}
            >
              <div
                className="flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={selectedItems.has(key)}
                  onChange={() => handleSelect(key, true)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
              <div className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
                <Folder size={18} fill="currentColor" className="opacity-80" />
              </div>
              <div className="flex-1 min-w-0 font-medium text-sm">{name}</div>
              <div className="text-xs text-muted-foreground">
                {meta.encrypted ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 font-medium",
                      meta.unlocked ? "text-emerald-600" : "text-amber-600"
                    )}
                  >
                    {meta.unlocked ? (
                      <Unlock className="h-3.5 w-3.5" />
                    ) : (
                      <Lock className="h-3.5 w-3.5" />
                    )}
                    {meta.unlocked ? "Kilitsiz" : "Şifreli"}
                  </span>
                ) : (
                  "Klasör"
                )}
              </div>

              {/* Folder Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {!meta.encrypted && onConvertFolder ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!loading) onConvertFolder(d);
                    }}
                    className="rounded p-1 hover:bg-muted/10"
                    disabled={loading}
                    aria-label={`${name} klasörünü şifrele`}
                  >
                    <Lock className="size-4 text-primary" />
                  </button>
                ) : null}
                {onRenameFolder ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!loading) onRenameFolder(d);
                    }}
                    className="rounded p-1 hover:bg-muted/10"
                    disabled={loading}
                    aria-label={`${name} klasörünü yeniden adlandır`}
                  >
                    <Pencil className="size-4 text-muted-foreground" />
                  </button>
                ) : null}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!loading && onDelete) onDelete(d);
                  }}
                  className="rounded p-1 hover:bg-muted/10"
                  disabled={loading || Boolean(deleting[key])}
                >
                  <Trash2 className="size-4 text-destructive" />
                </button>
              </div>
            </div>
          </DraggableItem>
        );
      })}

      {/* Files */}
      {(loading ? Array.from({ length: 4 }) : contents ?? []).map(
        (item: unknown, idx) => {
          const c = loading ? undefined : (item as CloudObject);
          const key = c?.Path?.Key ?? `file-${idx}`;

          if (loading) {
            return (
              <div key={idx} className="flex items-center gap-4 px-4 py-3">
                <div className="h-8 w-8 rounded bg-muted/30 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-muted/30 animate-pulse" />
                  <div className="h-3 w-1/4 rounded bg-muted/30 animate-pulse" />
                </div>
              </div>
            );
          }

          return (
            <DraggableItem
              key={key}
              id={key}
              type="file"
              selected={selectedItems.has(key)}
              onSelect={(multi) => handleSelect(key, multi)}
              onClick={() => {}}
              className="group"
              data={c}
            >
              <div
                className="flex items-center gap-4 px-4 py-3 hover:bg-muted/10 cursor-pointer"
                onClick={(e) => handleItemClick(c!, "file", e)}
              >
                <div
                  className="flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.has(key)}
                    onChange={() => handleSelect(key, true)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </div>
                <div className="w-8 h-8 flex items-center justify-center rounded-md bg-muted/20">
                  <FileIcon extension={c!.Extension} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground truncate">
                    {c!.Metadata?.Originalfilename || c!.Name}
                    <span className="text-xs text-muted-foreground">
                      .{c!.Extension}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {c!.MimeType ?? "—"}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="whitespace-nowrap hidden sm:block">
                    {humanFileSize(c!.Size)}
                  </div>
                  <div className="whitespace-nowrap hidden md:block">
                    {c?.LastModified
                      ? new Date(c!.LastModified).toLocaleString()
                      : "—"}
                  </div>
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="rounded p-1 hover:bg-muted/10"
                        >
                          <MoreHorizontal
                            size={16}
                            className="text-muted-foreground"
                          />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!loading && c) setToEdit(c);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!loading && c && c.Path?.Key && onMoveClick)
                              onMoveClick([c.Path.Key]);
                          }}
                        >
                          <FolderInput className="mr-2 h-4 w-4" />
                          Move
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!loading && c && onDelete) onDelete(c);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </DraggableItem>
          );
        }
      )}
    </div>
  );

  const renderGrid = () => (
    // use a simple masonry-like layout using CSS columns so items can
    // have variable heights (tall / wide images won't be cropped to squares)
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 items-start">
      {/* Directories */}
      {(directories ?? []).map((d, idx) => {
        const key = d.Prefix || `dir-${idx}`;
        const meta = getDirectoryMeta(d);
        const name = meta.displayName;

        return (
          <DraggableItem
            key={key}
            id={key}
            type="folder"
            selected={selectedItems.has(key)}
            onSelect={(multi) => handleSelect(key, multi)}
            onClick={() => {}}
            className="group"
            data={d}
          >
            <div
              className="relative inline-block w-full rounded-xl border bg-card hover:bg-muted/10 cursor-pointer transition-colors overflow-hidden p-0"
              style={{
                gridColumnEnd: `span ${spans[key]?.col ?? 1}`,
                gridRowEnd: `span ${spans[key]?.row ?? 1}`,
              }}
              onClick={(e) => handleItemClick(d, "folder", e)}
            >
              {/* ensure folders stay a predictable square tile so they don't stretch */}
              <div className="aspect-square p-3 flex flex-col items-center justify-center gap-2">
                <div
                  className="absolute top-2 left-2 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.has(key)}
                    onChange={() => handleSelect(key, true)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </div>
                <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 mb-2">
                  <Folder
                    size={32}
                    fill="currentColor"
                    className="opacity-80"
                  />
                </div>
                <div className="text-sm font-medium text-center truncate w-full px-2">
                  {name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {meta.encrypted ? (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium",
                        meta.unlocked
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      )}
                    >
                      {meta.unlocked ? (
                        <Unlock className="h-3.5 w-3.5" />
                      ) : (
                        <Lock className="h-3.5 w-3.5" />
                      )}
                      {meta.unlocked ? "Kilitsiz" : "Şifreli"}
                    </span>
                  ) : (
                    "Klasör"
                  )}
                </div>

                {/* folder actions placed at top-right inside the tile */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!meta.encrypted && onConvertFolder ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!loading) onConvertFolder(d);
                      }}
                      className="rounded-full p-1.5 bg-background/80 hover:bg-muted shadow-sm border"
                      disabled={loading}
                      aria-label={`${name} klasörünü şifrele`}
                    >
                      <Lock className="size-4 text-primary" />
                    </button>
                  ) : null}
                  {onRenameFolder ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!loading) onRenameFolder(d);
                      }}
                      className="rounded-full p-1.5 bg-background/80 hover:bg-muted shadow-sm border"
                      disabled={loading}
                      aria-label={`${name} klasörünü yeniden adlandır`}
                    >
                      <Pencil className="size-4" />
                    </button>
                  ) : null}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!loading && onDelete) onDelete(d);
                    }}
                    className="rounded-full p-1.5 bg-background/80 hover:bg-destructive/10 hover:text-destructive shadow-sm border"
                    disabled={loading || Boolean(deleting[key])}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </DraggableItem>
        );
      })}

      {/* Files */}
      {(loading ? Array.from({ length: 8 }) : contents ?? []).map(
        (item: unknown, idx) => {
          const c = loading ? undefined : (item as CloudObject);
          const key = c?.Path?.Key ?? `file-${idx}`;

          if (loading) {
            return (
              <div
                key={idx}
                className="aspect-square rounded-xl border bg-muted/10 p-4 flex flex-col gap-3"
              >
                <div className="flex-1 rounded-lg bg-muted/20 animate-pulse" />
                <div className="h-4 w-2/3 rounded bg-muted/20 animate-pulse mx-auto" />
              </div>
            );
          }

          return (
            <DraggableItem
              key={key}
              id={key}
              type="file"
              selected={selectedItems.has(key)}
              onSelect={(multi) => handleSelect(key, multi)}
              onClick={() => {}}
              className="group"
              data={c}
            >
              <div
                className="relative inline-block w-full mb-3 rounded-xl border bg-card hover:bg-muted/10 cursor-pointer transition-colors overflow-hidden"
                style={{
                  gridColumnEnd: `span ${spans[key]?.col ?? 1}`,
                  gridRowEnd: `span ${spans[key]?.row ?? 1}`,
                }}
                onClick={(e) => handleItemClick(c!, "file", e)}
              >
                <div
                  className="absolute top-2 left-2 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.has(key)}
                    onChange={() => handleSelect(key, true)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </div>

                <div className="w-full overflow-hidden rounded-lg bg-muted/5 relative">
                  <GridThumbnail
                    file={c!}
                    onSpan={(s) => setSpanForKey(key, s)}
                  />

                  {/* overlay metadata so the image area is used fully and there's no extra vertical gap */}
                  <div className="absolute left-0 right-0 bottom-0 px-3 py-2 bg-linear-to-t from-black/60 to-transparent text-white text-xs flex items-center justify-between gap-2">
                    <div className="truncate font-medium" title={c!.Name}>
                      {c!.Name}
                    </div>
                    <div className="whitespace-nowrap opacity-90 hidden sm:block">
                      {humanFileSize(c!.Size)}
                    </div>
                  </div>
                </div>

                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!loading && c && onDelete) onDelete(c);
                    }}
                    className="rounded-full p-1.5 bg-background/80 hover:bg-destructive/10 hover:text-destructive shadow-sm border"
                    disabled={loading || Boolean(deleting[c!.Path?.Key ?? ""])}
                  >
                    <Trash2 className="size-4" />
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-full p-1.5 bg-background/80 hover:bg-muted shadow-sm border"
                      >
                        <MoreHorizontal
                          size={16}
                          className="text-muted-foreground"
                        />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!loading && c) setToEdit(c);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!loading && c && c.Path?.Key && onMoveClick)
                            onMoveClick([c.Path.Key]);
                        }}
                      >
                        <FolderInput className="mr-2 h-4 w-4" />
                        Move
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </DraggableItem>
          );
        }
      )}
    </div>
  );

  return (
    <>
      {viewMode === "list" ? renderList() : renderGrid()}

      <EditFileModal
        file={toEdit}
        open={!!toEdit}
        onClose={() => setToEdit(null)}
        onConfirm={async () => {
          setToEdit(null);
        }}
      />
    </>
  );
}
