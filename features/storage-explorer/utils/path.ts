export const normalizeFolderPath = (path?: string | null) => {
  if (!path) return "";
  return path.replace(/^\/+|\/+$/g, "");
};

export const getFolderNameFromPrefix = (prefix?: string | null) => {
  if (!prefix) return "";
  const segments = prefix.split("/").filter(Boolean);
  return segments.length ? segments[segments.length - 1] : prefix;
};

export const normalizeStoragePath = (path?: string | null) => {
  if (!path) return "";
  return path.replace(/^\/+|\/+$/g, "");
};

export const getParentPath = (key: string) => {
  const trimmed = key.replace(/^\/+/, "");
  const lastSlash = trimmed.lastIndexOf("/");
  if (lastSlash === -1) return "";
  return trimmed.slice(0, lastSlash);
};
