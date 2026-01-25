import React from "react";
import { Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import FileIcon from "@/components/Storage/FileIcon";
import { getCloudObjectUrl, getImageCdnUrl, isImageFile } from "@/components/Storage/imageCdn";
import { FileThumbnail } from "@/components/storage-browser/thumbnails/FileThumbnail";
import { VideoThumbnail } from "@/components/storage-browser/thumbnails/VideoThumbnail";
import type { CloudObject } from "@/components/storage-browser/types/storage-browser.types";

const VIDEO_EXTENSIONS = ["mp4", "webm", "ogg", "mov", "mkv"];

export const GridThumbnail = ({
  file,
  onAspectRatioChange,
  className,
}: {
  file: CloudObject;
  onAspectRatioChange?: (aspectRatio: number) => void;
  className?: string;
}) => {
  const [isThumbnailLoaded, setIsThumbnailLoaded] = React.useState(false);
  const [hasThumbnailError, setHasThumbnailError] = React.useState(false);
  const [isVideoThumbnailLoading, setIsVideoThumbnailLoading] =
    React.useState(false);
  const lastAspectRatioRef = React.useRef<number | null>(null);

  const thumbnailKey = file.Path?.Key || file.Name || "thumb";
  const baseUrl = getCloudObjectUrl(file);
  const latestBaseUrlRef = React.useRef<string | undefined>(baseUrl);
  const stableKeyRef = React.useRef<string>(thumbnailKey);
  const [stableBaseUrl, setStableBaseUrl] = React.useState(baseUrl);

  React.useEffect(() => {
    latestBaseUrlRef.current = baseUrl;
  }, [baseUrl]);

  React.useEffect(() => {
    if (stableKeyRef.current !== thumbnailKey) {
      stableKeyRef.current = thumbnailKey;
      setStableBaseUrl(baseUrl);
      setIsThumbnailLoaded(false);
      setHasThumbnailError(false);
      return;
    }
    if (!stableBaseUrl && baseUrl) {
      setStableBaseUrl(baseUrl);
    }
  }, [baseUrl, stableBaseUrl, thumbnailKey]);

  const stableFile = React.useMemo(() => {
    if (!stableBaseUrl || file.Path?.Url === stableBaseUrl) return file;
    return {
      ...file,
      Path: { ...file.Path, Url: stableBaseUrl },
    };
  }, [file, stableBaseUrl]);

  const mimeType = (file?.MimeType ?? "").toLowerCase();
  const extension = (file.Extension || "").toLowerCase();
  const isImage = isImageFile(file);
  const isVideo =
    mimeType.startsWith("video") || VIDEO_EXTENSIONS.includes(extension);
  const thumbnailUrl = isImage
    ? getImageCdnUrl(stableFile, { target: "thumb" })
    : stableBaseUrl;

  const updateAspectRatio = (width: number, height: number) => {
    const aspectRatio = Math.max(width / height, 0.1);
    if (
      !lastAspectRatioRef.current ||
      Math.abs(lastAspectRatioRef.current - aspectRatio) > 0.01
    ) {
      lastAspectRatioRef.current = aspectRatio;
      onAspectRatioChange?.(aspectRatio);
    }
  };

  const handleImageReady = (imageElement: HTMLImageElement | null) => {
    if (!imageElement) return;
    const width = imageElement.naturalWidth || imageElement.width || 1;
    const height = imageElement.naturalHeight || imageElement.height || 1;
    updateAspectRatio(width, height);
  };

  const handleVideoAspectRatio = (width: number, height: number) => {
    updateAspectRatio(width || 1, height || 1);
  };

  if ((!isImage && !isVideo) || !thumbnailUrl || hasThumbnailError) {
    return (
      <div
        className={cn(
          "w-full h-full min-h-[160px] flex items-center justify-center rounded-md bg-muted/20",
          className,
        )}
      >
        <FileIcon extension={file.Extension} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full relative rounded-md overflow-hidden bg-muted/5 flex items-center justify-center",
        className,
      )}
      style={{
        maxHeight: className?.includes("min-h-") ? undefined : "60vh",
        aspectRatio: lastAspectRatioRef.current
          ? `${lastAspectRatioRef.current}`
          : undefined,
      }}
    >
      {(!isThumbnailLoaded || (isVideo && isVideoThumbnailLoading)) && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
        </div>
      )}

      {isImage && thumbnailUrl && (
        <FileThumbnail
          imageUrl={thumbnailUrl}
          fileName={file.Name}
          isLoaded={isThumbnailLoaded}
          onLoaded={() => setIsThumbnailLoaded(true)}
          onError={() => {
            const latestBaseUrl = latestBaseUrlRef.current;
            if (latestBaseUrl && latestBaseUrl !== stableBaseUrl) {
              setStableBaseUrl(latestBaseUrl);
              setIsThumbnailLoaded(false);
              return;
            }
            setHasThumbnailError(true);
          }}
          onImageReady={handleImageReady}
        />
      )}

      {isVideo && thumbnailUrl && (
        <div className="w-full h-auto flex items-center justify-center bg-black">
          <VideoThumbnail
            videoUrl={thumbnailUrl}
            fileName={file.Name}
            isLoaded={isThumbnailLoaded}
            onLoaded={() => setIsThumbnailLoaded(true)}
            onAspectRatioChange={handleVideoAspectRatio}
            onLoadingStateChange={setIsVideoThumbnailLoading}
          />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="h-10 w-10 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
              <Play className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
