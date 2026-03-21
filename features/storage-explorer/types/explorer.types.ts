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

export type DuplicateScanJob = {
  scanId: string;
  path: string;
  state:
    | "starting"
    | "pending"
    | "scanning"
    | "completed"
    | "cancelled"
    | "failed";
  progress?: {
    totalFiles?: number;
    processedFiles?: number;
    phase?: string;
    percentage?: number;
  };
  result?: {
    totalFilesScanned?: number;
    totalDuplicateGroups?: number;
    totalPotentialSavingsBytes?: number;
    groups?: Array<{
      groupId?: string;
      matchType?: string;
      similarity?: number;
      files?: Array<{
        key?: string;
        name?: string;
        size?: number;
        lastModified?: string;
        mimeType?: string;
        path?: {
          host?: string;
          key?: string;
          url?: string;
        };
      }>;
      potentialSavingsBytes?: number;
    }>;
  };
  error?: string;
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
