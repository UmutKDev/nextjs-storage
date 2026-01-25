import React from "react";

const MIN_THUMBNAIL_ASPECT_RATIO = 0.25;
const MAX_THUMBNAIL_ASPECT_RATIO = 4;
const ASPECT_RATIO_UPDATE_THRESHOLD = 0.01;

export const useThumbnailAspectRatio = () => {
  const [thumbnailAspectRatioByKey, setThumbnailAspectRatioByKey] =
    React.useState<Record<string, number>>({});

  const updateThumbnailAspectRatio = React.useCallback(
    (itemKey: string, aspectRatio: number) => {
      if (!aspectRatio || Number.isNaN(aspectRatio)) return;
      const clampedAspectRatio = Math.min(
        Math.max(aspectRatio, MIN_THUMBNAIL_ASPECT_RATIO),
        MAX_THUMBNAIL_ASPECT_RATIO,
      );

      setThumbnailAspectRatioByKey((previous) => {
        const existingAspectRatio = previous[itemKey];
        if (
          existingAspectRatio &&
          Math.abs(existingAspectRatio - clampedAspectRatio) <
            ASPECT_RATIO_UPDATE_THRESHOLD
        ) {
          return previous;
        }

        return { ...previous, [itemKey]: clampedAspectRatio };
      });
    },
    [],
  );

  return { thumbnailAspectRatioByKey, updateThumbnailAspectRatio };
};
