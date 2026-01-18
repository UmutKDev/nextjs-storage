import type { CloudObjectModel } from "@/Service/Generates/api";
import { getSessionTokenForPath } from "@/lib/encryption";

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "bmp",
  "ico",
]);

const VECTOR_EXTENSIONS = new Set(["svg", "ico"]);

const MAX_DIM_BY_TARGET = {
  thumb: 640,
  preview: 1600,
  fullscreen: 2400,
} as const;

type ImageCdnTarget = keyof typeof MAX_DIM_BY_TARGET;

const getFileExtension = (file?: CloudObjectModel) => {
  const direct = (file?.Extension || "").toLowerCase();
  if (direct) return direct;
  const fromName =
    file?.Metadata?.Originalfilename || file?.Name || "";
  return fromName.split(".").pop()?.toLowerCase() || "";
};

const parseDimension = (value?: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
};

export const isImageFile = (file?: CloudObjectModel) => {
  if (!file) return false;
  const mime = (file.MimeType || "").toLowerCase();
  if (mime.startsWith("image/")) return true;
  return IMAGE_EXTENSIONS.has(getFileExtension(file));
};

const buildDownloadUrl = (key: string, sessionToken?: string | null) => {
  const params = new URLSearchParams();
  params.set("Key", key);
  if (sessionToken) {
    params.set("folderSession", sessionToken);
  }
  return `/api/Api/Cloud/Download?${params.toString()}`;
};

export const getCloudObjectUrl = (file?: CloudObjectModel) => {
  if (!file?.Path?.Key) return undefined;
  const sessionToken = getSessionTokenForPath(file.Path.Key);
  return buildDownloadUrl(file.Path.Key, sessionToken);
};

const appendQueryParams = (
  url: string,
  params: Record<string, string | number | undefined>
) => {
  const [base, query] = url.split("?");
  const search = new URLSearchParams(query || "");

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;
    search.set(key, String(value));
  });

  const next = search.toString();
  return next ? `${base}?${next}` : base;
};

export const getImageCdnUrl = (
  file?: CloudObjectModel,
  options?: {
    target?: ImageCdnTarget;
    maxDim?: number;
  }
) => {
  const baseUrl = getCloudObjectUrl(file);
  if (!file || !baseUrl || !isImageFile(file)) return baseUrl;

  const mime = (file.MimeType || "").toLowerCase();
  const ext = getFileExtension(file);
  if (VECTOR_EXTENSIONS.has(ext) || mime.includes("svg")) return baseUrl;

  const maxDim =
    options?.maxDim ?? MAX_DIM_BY_TARGET[options?.target ?? "preview"];
  if (!maxDim) return baseUrl;

  const { width: targetWidth, height: targetHeight } =
    getScaledImageDimensions(file, { target: options?.target, maxDim }) ?? {};

  return appendQueryParams(baseUrl, {
    w: targetWidth,
    h: targetHeight,
  });
};

export const getScaledImageDimensions = (
  file?: CloudObjectModel,
  options?: {
    target?: ImageCdnTarget;
    maxDim?: number;
  }
) => {
  if (!file || !isImageFile(file)) return null;
  const mime = (file.MimeType || "").toLowerCase();
  const ext = getFileExtension(file);
  if (VECTOR_EXTENSIONS.has(ext) || mime.includes("svg")) return null;

  const maxDim =
    options?.maxDim ?? MAX_DIM_BY_TARGET[options?.target ?? "preview"];
  if (!maxDim) return null;

  const width = parseDimension(file.Metadata?.Width);
  const height = parseDimension(file.Metadata?.Height);
  if (!width || !height) return null;

  const maxSide = Math.max(width, height);
  const scale = Math.min(1, maxDim / maxSide);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
};
