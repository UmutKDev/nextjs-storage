import React from "react";
import { cn } from "@/lib/utils";

type FileThumbnailProps = {
  imageUrl: string;
  fileName?: string;
  isLoaded: boolean;
  onLoaded: () => void;
  onError: () => void;
  onImageReady: (image: HTMLImageElement | null) => void;
  className?: string;
};

export const FileThumbnail = ({
  imageUrl,
  fileName,
  isLoaded,
  onLoaded,
  onError,
  onImageReady,
  className,
}: FileThumbnailProps) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={imageUrl}
    alt={fileName}
    ref={(element) => {
      if (element) onImageReady(element);
    }}
    className={cn(
      "w-full h-auto object-contain transition-all duration-300",
      isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95",
      className,
    )}
    onLoad={onLoaded}
    onError={onError}
    loading="lazy"
  />
);
