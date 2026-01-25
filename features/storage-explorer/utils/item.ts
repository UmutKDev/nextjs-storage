import type {
  CloudDirectoryModel,
  CloudObjectModel,
} from "@/Service/Generates/api";

export const getItemDisplayName = (
  entry: CloudObjectModel | CloudDirectoryModel
) => {
  if ("Prefix" in entry) {
    const prefix = entry.Prefix ?? "";
    const segments = prefix.split("/").filter(Boolean);
    return segments.length ? segments[segments.length - 1] : prefix;
  }
  return entry.Name;
};

export const getFileDisplayName = (entry: CloudObjectModel) => {
  return entry.Metadata?.Originalfilename || entry.Name || "dosya";
};
