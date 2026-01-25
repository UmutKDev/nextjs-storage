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

export type ExplorerExtractJob = {
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
