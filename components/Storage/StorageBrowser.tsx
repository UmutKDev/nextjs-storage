import JustifiedGrid from "./JustifiedGrid";
import React from "react";
import {
  MoreHorizontal,
  Folder,
  Trash2,
  
  
  Loader2,
  
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useStorage } from "./StorageProvider";


import EditFileModal from "./EditFileModal";
import FileIcon from "./FileIcon";

import { cn } from "@/lib/utils";

import {
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

import type {
  CloudObjectModel,
  CloudDirectoryModel,
} from "@/Service/Generates/api";



type CloudObject = CloudObjectModel;
type Directory = CloudDirectoryModel;

export type ViewMode = "list" | "grid" | "smart";

// --- Helper Components ---

function GridThumbnail({ file }: { file: CloudObject }) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  const url = file?.Path?.Url ?? file?.Path?.Key;
  const mime = (file?.MimeType ?? "").toLowerCase();
  const ext = (file.Extension || "").toLowerCase();

  const isImage =
    mime.startsWith("image") ||
    ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext);

  if (!isImage || !url || error) {
    return (
      <div className="w-12 h-12 flex items-center justify-center rounded-md bg-muted/20">
        <FileIcon extension={file.Extension} />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative rounded-md overflow-hidden bg-muted/5">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={file.Name}
        className={`w-full h-full object-cover transition-all duration-300 ${
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
      />
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
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { type, id, ...(data as object) },
    });

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id,
    data: { type, id, ...(data as object) },
    disabled: type === "file", // only folders can be drop targets
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined;

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        setDroppableRef(node);
      }}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "relative transition-colors outline-none",
        isDragging && "opacity-50",
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
  
}: StorageBrowserProps) {
  const { currentPath, setCurrentPath } = useStorage();
  const [toEdit, setToEdit] = React.useState<CloudObject | null>(null);

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
      const prefix = dir?.Prefix ?? "";
      const segments = prefix.split("/").filter(Boolean);
      const name = segments.length
        ? segments[segments.length - 1]
        : prefix || "";
      if (!loading)
        setCurrentPath(currentPath ? `${currentPath}/${name}` : name);
    } else {
      if (!loading && onPreview) onPreview(item as CloudObject);
    }
  };

  // --- Renderers ---

  const renderList = () => (
    <div className="divide-y rounded-md border bg-background/50">
      {/* Directories */}
      {(directories ?? []).map((d, idx) => {
        const prefix = d?.Prefix ?? "";
        const segments = prefix.split("/").filter(Boolean);
        const name = segments.length
          ? segments[segments.length - 1]
          : prefix || "";
        const key = d.Prefix || `dir-${idx}`;

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
              <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
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
              <div className="text-xs text-muted-foreground">Klasör</div>

              {/* Folder Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!loading && c && onDelete) onDelete(c);
                      }}
                      className="rounded p-1 hover:bg-muted/10"
                      disabled={
                        loading || Boolean(deleting[c!.Path?.Key ?? ""])
                      }
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </button>

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

  
          const renderGrid = () => {
    const allItems = [...(directories ?? []), ...(contents ?? [])];
    
    if (loading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, idx) => (
                    <div key={idx} className="aspect-square rounded-xl border bg-muted/10 p-4 flex flex-col gap-3">
                        <div className="flex-1 rounded-lg bg-muted/20 animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <JustifiedGrid
            items={allItems}
            targetRowHeight={220}
            renderItem={(item) => {
                const isFolder = 'Prefix' in item;
                const key = isFolder ? (item as Directory).Prefix : (item as CloudObject).Path?.Key;
                if (!key) return null;

                if (isFolder) {
                    const d = item as Directory;
                    const prefix = d.Prefix ?? "";
                    const segments = prefix.split("/").filter(Boolean);
                    const name = segments.length ? segments[segments.length - 1] : prefix || "";
                    
                    return (
                        <DraggableItem
                            key={key}
                            id={key}
                            type="folder"
                            selected={selectedItems.has(key)}
                            onSelect={(multi) => handleSelect(key, multi)}
                            onClick={() => {}}
                            className="group w-full h-full"
                            data={d}
                        >
                            <div
                                className="relative flex flex-col items-center gap-2 p-2 rounded-xl border bg-card hover:bg-muted/10 cursor-pointer transition-colors w-full h-full justify-center"
                                onClick={(e) => handleItemClick(d, "folder", e)}
                            >
                                <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedItems.has(key)}
                                        onChange={() => handleSelect(key, true)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                </div>
                                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                                    <Folder size={24} fill="currentColor" className="opacity-80" />
                                </div>
                                <div className="text-sm font-medium text-center truncate w-full px-1">
                                    {name}
                                </div>
                                
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                        </DraggableItem>
                    );
                } else {
                    const c = item as CloudObject;
                    return (
                        <DraggableItem
                            key={key}
                            id={key}
                            type="file"
                            selected={selectedItems.has(key)}
                            onSelect={(multi) => handleSelect(key, multi)}
                            onClick={() => {}}
                            className="group w-full h-full"
                            data={c}
                        >
                            <div
                                className="relative w-full h-full rounded-xl border bg-card hover:bg-muted/10 cursor-pointer transition-colors overflow-hidden"
                                onClick={(e) => handleItemClick(c, "file", e)}
                            >
                                <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedItems.has(key)}
                                        onChange={() => handleSelect(key, true)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary shadow-sm"
                                    />
                                </div>
                                
                                <div className="w-full h-full">
                                    <GridThumbnail file={c} />
                                </div>

                                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="text-white text-sm font-medium truncate">
                                        {c.Name}
                                    </div>
                                    <div className="text-white/80 text-xs truncate">
                                        {humanFileSize(c.Size)}
                                    </div>
                                </div>

                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!loading && c && onDelete) onDelete(c);
                                        }}
                                        className="rounded-full p-1.5 bg-background/80 hover:bg-destructive/10 hover:text-destructive shadow-sm border"
                                        disabled={loading || Boolean(deleting[c.Path?.Key ?? ""])}
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
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </DraggableItem>
                    );
                }
            }}
        />
    );
  };

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
