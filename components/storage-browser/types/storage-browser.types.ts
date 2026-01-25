import type {
  CloudObjectModel,
  CloudDirectoryModel,
} from "@/Service/Generates/api";

export type CloudObject = CloudObjectModel;
export type Directory = CloudDirectoryModel;

export type ViewMode = "list" | "grid";

export type ZipExtractJob = {
  key: string;
  jobId?: string;
  state: string;
  progress?: {
    entriesProcessed?: number;
    totalEntries?: number | null;
    bytesRead?: number;
    totalBytes?: number | null;
    currentEntry?: string;
  };
  extractedPath?: string;
  failedReason?: string;
  updatedAt: number;
};

export type ZipExtractJobsByKey = Record<string, ZipExtractJob>;

export type StorageItemType = "file" | "folder";
