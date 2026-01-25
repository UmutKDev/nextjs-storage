import React from "react";
import { Folder, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import FileIcon from "@/components/Storage/FileIcon";
import { getCloudObjectUrl } from "@/components/Storage/imageCdn";
import type {
  CloudObject,
  Directory,
} from "@/components/storage-browser/types/storage-browser.types";

const FOLDER_THUMBNAIL_LIMIT = 4;
const FOLDER_THUMBNAIL_MAX_DIMENSION = 560;

export const FolderThumbnail = ({
  directory,
  className,
}: {
  directory: Directory;
  className?: string;
}) => {
  const thumbnails = React.useMemo(
    () => (directory.Thumbnails ?? []).slice(0, FOLDER_THUMBNAIL_LIMIT),
    [directory.Thumbnails],
  );
  const [failedThumbnailKeys, setFailedThumbnailKeys] = React.useState<
    Record<string, boolean>
  >({});
  const [loadedThumbnailKeys, setLoadedThumbnailKeys] = React.useState<
    Record<string, boolean>
  >({});
  const [thumbnailDataByKey, setThumbnailDataByKey] = React.useState<
    Record<
      string,
      { url?: string; width?: number; height?: number }
    >
  >({});
  const [thumbnailDataVersion, setThumbnailDataVersion] = React.useState(0);
  const stableUrlByKeyRef = React.useRef<Map<string, string>>(new Map());
  const latestUrlByKeyRef = React.useRef<Map<string, string>>(new Map());

  const buildThumbnailData = React.useCallback((file: CloudObject) => {
    const thumbnailKey = file.Path?.Key || file.Name || "thumb";
    const baseUrl = getCloudObjectUrl(file);
    if (!baseUrl) return { url: undefined as string | undefined };

    latestUrlByKeyRef.current.set(thumbnailKey, baseUrl);
    if (!stableUrlByKeyRef.current.has(thumbnailKey)) {
      stableUrlByKeyRef.current.set(thumbnailKey, baseUrl);
    }
    const stableBaseUrl =
      stableUrlByKeyRef.current.get(thumbnailKey) || baseUrl;

    const width = Number(file.Metadata?.Width);
    const height = Number(file.Metadata?.Height);
    const hasDimensions = Number.isFinite(width) && Number.isFinite(height);
    const maxSide = hasDimensions
      ? Math.max(width, height)
      : FOLDER_THUMBNAIL_MAX_DIMENSION;
    const scale = Math.min(1, FOLDER_THUMBNAIL_MAX_DIMENSION / maxSide);
    const scaledWidth = Math.max(
      1,
      Math.round(
        (hasDimensions ? width : FOLDER_THUMBNAIL_MAX_DIMENSION) * scale,
      ),
    );
    const scaledHeight = Math.max(
      1,
      Math.round(
        (hasDimensions ? height : FOLDER_THUMBNAIL_MAX_DIMENSION) * scale,
      ),
    );

    const [base, query] = stableBaseUrl.split("?");
    const search = new URLSearchParams(query || "");
    search.set("w", String(scaledWidth));
    search.set("h", String(scaledHeight));
    const next = search.toString();
    return {
      url: next ? `${base}?${next}` : base,
      width: scaledWidth,
      height: scaledHeight,
    };
  }, []);

  const markThumbnailAsFailed = React.useCallback((thumbnailKey: string) => {
    const latestUrl = latestUrlByKeyRef.current.get(thumbnailKey);
    const stableUrl = stableUrlByKeyRef.current.get(thumbnailKey);
    if (latestUrl && latestUrl !== stableUrl) {
      stableUrlByKeyRef.current.set(thumbnailKey, latestUrl);
      setLoadedThumbnailKeys((previous) => ({
        ...previous,
        [thumbnailKey]: false,
      }));
      setFailedThumbnailKeys((previous) => {
        if (!previous[thumbnailKey]) return previous;
        const next = { ...previous };
        delete next[thumbnailKey];
        return next;
      });
      setThumbnailDataVersion((previous) => previous + 1);
      return;
    }
    setFailedThumbnailKeys((previous) =>
      previous[thumbnailKey] ? previous : { ...previous, [thumbnailKey]: true },
    );
  }, []);

  const markThumbnailAsLoaded = React.useCallback((thumbnailKey: string) => {
    setLoadedThumbnailKeys((previous) =>
      previous[thumbnailKey] ? previous : { ...previous, [thumbnailKey]: true },
    );
  }, []);

  React.useEffect(() => {
    const next: Record<
      string,
      { url?: string; width?: number; height?: number }
    > = {};
    thumbnails.forEach((file, index) => {
      const thumbnailKey = file.Path?.Key || file.Name || `thumb-${index}`;
      next[thumbnailKey] = buildThumbnailData(file);
    });
    setThumbnailDataByKey((previous) => {
      const prevKeys = Object.keys(previous);
      const nextKeys = Object.keys(next);
      if (prevKeys.length !== nextKeys.length) return next;
      for (const key of nextKeys) {
        const prevValue = previous[key];
        const nextValue = next[key];
        if (!prevValue || !nextValue) return next;
        if (
          prevValue.url !== nextValue.url ||
          prevValue.width !== nextValue.width ||
          prevValue.height !== nextValue.height
        ) {
          return next;
        }
      }
      return previous;
    });
  }, [buildThumbnailData, thumbnails, thumbnailDataVersion]);

  if (!thumbnails.length) {
    return (
      <div
        className={cn(
          "w-full h-full flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 via-blue-500/5 to-transparent text-blue-600",
          className,
        )}
      >
        <Folder
          size={84}
          fill="currentColor"
          className="opacity-80 md:w-24 md:h-24"
        />
      </div>
    );
  }

  const renderThumbnail = (file: CloudObject, index: number) => {
    const thumbnailKey = file.Path?.Key || file.Name || `thumb-${index}`;
    const { url, width, height } = thumbnailDataByKey[thumbnailKey] ?? {};

    if (!url || failedThumbnailKeys[thumbnailKey]) {
      return (
        <div
          key={thumbnailKey}
          className="w-full h-full flex items-center justify-center rounded-sm bg-muted/20"
        >
          <div className="scale-75">
            <FileIcon extension={file.Extension} />
          </div>
        </div>
      );
    }

    return (
      <div key={thumbnailKey} className="relative w-full h-full">
        {!loadedThumbnailKeys[thumbnailKey] && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/70" />
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={file.Name}
          className="w-full h-full object-cover rounded-sm transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
          width={width}
          height={height}
          onLoad={() => markThumbnailAsLoaded(thumbnailKey)}
          onError={() => markThumbnailAsFailed(thumbnailKey)}
        />
      </div>
    );
  };

  if (thumbnails.length === 1) {
    const file = thumbnails[0];
    const thumbnailKey = file.Path?.Key || file.Name || "thumb-single";
    const { url, width, height } = thumbnailDataByKey[thumbnailKey] ?? {};

    return (
      <div
        className={cn(
          "relative w-full h-full rounded-xl overflow-hidden bg-muted/10",
          className,
        )}
      >
        {url && !failedThumbnailKeys[thumbnailKey] ? (
          <div className="relative w-full h-full">
            {!loadedThumbnailKeys[thumbnailKey] && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/70" />
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={file.Name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
              width={width}
              height={height}
              onLoad={() => markThumbnailAsLoaded(thumbnailKey)}
              onError={() => markThumbnailAsFailed(thumbnailKey)}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/20">
            <div className="scale-75">
              <FileIcon extension={file.Extension} />
            </div>
          </div>
        )}
        <div className="absolute bottom-1 right-1 rounded-full bg-background/80 border p-0.5 shadow-sm backdrop-blur">
          <Folder size={12} className="text-muted-foreground" />
        </div>
      </div>
    );
  }

  const filledSlots = thumbnails.length;
  const placeholderSlots = Array.from(
    { length: Math.max(0, FOLDER_THUMBNAIL_LIMIT - filledSlots) },
    (_value, index) => index,
  );

  return (
    <div
      className={cn(
        "relative w-full h-full rounded-xl overflow-hidden bg-muted/10 p-0.5",
        className,
      )}
    >
      <div className="grid grid-cols-2 grid-rows-2 gap-0.5 w-full h-full">
        {thumbnails.map((file, index) => renderThumbnail(file, index))}
        {placeholderSlots.map((placeholderIndex) => (
          <div
            key={`placeholder-${placeholderIndex}`}
            className="w-full h-full rounded-sm bg-muted/10"
          />
        ))}
      </div>
      <div className="absolute bottom-1 right-1 rounded-full bg-background/80 border p-0.5 shadow-sm backdrop-blur">
        <Folder size={12} className="text-muted-foreground" />
      </div>
    </div>
  );
};
