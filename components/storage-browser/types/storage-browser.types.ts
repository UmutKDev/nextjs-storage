import type {
  CloudObjectModel,
  CloudDirectoryModel,
} from "@/Service/Generates/api";

export type CloudObject = CloudObjectModel;
export type Directory = CloudDirectoryModel;

export type ViewMode = "list" | "grid";

export type ArchiveExtractJob = {
  key: string;
  jobId?: string;
  state: string;
  format?: string;
  progress?: {
    phase?: "extract" | "create";
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

export type ArchiveExtractJobsByKey = Record<string, ArchiveExtractJob>;

export type ArchiveCreateJob = {
  jobId?: string;
  state: string;
  format?: string;
  outputKey?: string;
  progress?: {
    entriesProcessed?: number;
    totalEntries?: number | null;
    bytesProcessed?: number;
    totalBytes?: number | null;
  };
  archiveKey?: string;
  archiveSize?: number;
  failedReason?: string;
  updatedAt: number;
};

export type ArchiveCreateJobsByKey = Record<string, ArchiveCreateJob>;

export type StorageItemType = "file" | "folder";
