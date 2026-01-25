import React from "react";
import { cn } from "@/lib/utils";

const VIDEO_THUMBNAIL_SEEK_SECONDS = 1;
const VIDEO_THUMBNAIL_TIMEOUT_MS = 2000;

type VideoThumbnailProps = {
  videoUrl: string;
  fileName?: string;
  isLoaded: boolean;
  onLoaded: () => void;
  onAspectRatioChange: (width: number, height: number) => void;
  onLoadingStateChange: (isLoading: boolean) => void;
  className?: string;
};

export const VideoThumbnail = ({
  videoUrl,
  fileName,
  isLoaded,
  onLoaded,
  onAspectRatioChange,
  onLoadingStateChange,
  className,
}: VideoThumbnailProps) => {
  const [thumbnailDataUrl, setThumbnailDataUrl] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    if (!videoUrl) return;
    let isCancelled = false;
    onLoadingStateChange(true);

    async function generateThumbnail() {
      try {
        const videoElement = document.createElement("video");
        videoElement.crossOrigin = "anonymous";
        videoElement.preload = "metadata";
        videoElement.src = videoUrl;

        await new Promise<void>((resolve, reject) => {
          const onLoadedMetadata = () => resolve();
          const onLoadError = () => reject(new Error("video load error"));
          videoElement.addEventListener("loadedmetadata", onLoadedMetadata, {
            once: true,
          });
          videoElement.addEventListener("error", onLoadError, { once: true });
        });

        const seekTo = Math.min(
          VIDEO_THUMBNAIL_SEEK_SECONDS,
          Math.max(0, (videoElement.duration || 0) / 3),
        );

        await new Promise<void>((resolve, reject) => {
          const onSeeked = () => resolve();
          videoElement.currentTime = seekTo;
          videoElement.addEventListener("seeked", onSeeked, { once: true });
          setTimeout(
            () => reject(new Error("seek timeout")),
            VIDEO_THUMBNAIL_TIMEOUT_MS,
          );
        });

        const canvas = document.createElement("canvas");
        canvas.width = videoElement.videoWidth || 320;
        canvas.height = videoElement.videoHeight || 180;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("no-canvas-ctx");

        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        if (!isCancelled) {
          setThumbnailDataUrl(dataUrl);
        }
      } catch (error) {
        void error;
      } finally {
        if (!isCancelled) onLoadingStateChange(false);
      }
    }

    generateThumbnail();

    return () => {
      isCancelled = true;
    };
  }, [onLoadingStateChange, videoUrl]);

  if (thumbnailDataUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={thumbnailDataUrl}
        alt={fileName}
        onLoad={(event) => {
          onLoaded();
          const imageElement = event.currentTarget as HTMLImageElement;
          onAspectRatioChange(
            imageElement.naturalWidth || imageElement.width,
            imageElement.naturalHeight || imageElement.height,
          );
        }}
        className={cn(
          "w-full h-auto object-contain transition-all duration-300",
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95",
          className,
        )}
        loading="lazy"
      />
    );
  }

  return (
    <video
      src={videoUrl}
      muted
      playsInline
      preload="metadata"
      onLoadedMetadata={(event) => {
        const videoElement = event.currentTarget as HTMLVideoElement;
        onAspectRatioChange(
          videoElement.videoWidth || 1,
          videoElement.videoHeight || 1,
        );
        onLoaded();
      }}
      className={cn(
        "w-full h-auto object-contain transition-all duration-300",
        isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95",
        className,
      )}
    />
  );
};
