import type { CloudObjectModel } from "@/Service/Generates/api";

const ARCHIVE_EXTENSIONS = new Set(["zip", "tar", "gz", "rar"]);

export const isArchiveFile = (file?: CloudObjectModel): boolean => {
  if (!file) return false;
  const ext = (file.Extension || "").toLowerCase();
  if (ext && ARCHIVE_EXTENSIONS.has(ext)) return true;
  const name = (
    file.Metadata?.Originalfilename ||
    file.Name ||
    ""
  ).toLowerCase();
  if (name.endsWith(".tar.gz")) return true;
  for (const archiveExt of ARCHIVE_EXTENSIONS) {
    if (name.endsWith(`.${archiveExt}`)) return true;
  }
  return false;
};
