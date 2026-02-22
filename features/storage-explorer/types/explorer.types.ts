import type {
  CloudDirectoryModel,
  CloudObjectModel,
} from "@/Service/Generates/api";

export type ExplorerDirectory = CloudDirectoryModel;
export type ExplorerFile = CloudObjectModel;

export type ExplorerViewMode = "list" | "grid";

export type ExplorerMoveRequest = {
  sourceKeys: string[];
  targetKey: string;
  sourceName?: string;
  targetName?: string;
};

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
