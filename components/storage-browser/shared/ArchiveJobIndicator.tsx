import React from "react";
import {
  Archive,
  CheckCircle2,
  Loader2,
  XCircle,
  PackagePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ArchiveExtractJob,
  ArchiveCreateJob,
} from "@/components/storage-browser/types/storage-browser.types";
import { useArchiveExtractStatus } from "@/components/storage-browser/hooks/useArchiveExtractStatus";

type ArchiveJobIndicatorProps = {
  extractJob?: ArchiveExtractJob;
  createJob?: ArchiveCreateJob;
  variant: "grid" | "list";
};

const ACTIVE_STATES = new Set(["active", "waiting", "delayed", "starting"]);
const TERMINAL_STATES = new Set(["completed", "failed", "cancelled"]);

type JobInfo = {
  state: string;
  label: string;
  progress: number | null;
  type: "extract" | "create";
};

export const ArchiveJobIndicator = ({
  extractJob,
  createJob,
  variant,
}: ArchiveJobIndicatorProps) => {
  const {
    getReadableExtractStatus,
    getExtractProgress,
    getReadableCreateStatus,
    getCreateProgress,
  } = useArchiveExtractStatus();

  const job: JobInfo | null = React.useMemo(() => {
    if (extractJob) {
      return {
        state: extractJob.state.toLowerCase(),
        label: getReadableExtractStatus(extractJob),
        progress: getExtractProgress(extractJob),
        type: "extract",
      };
    }
    if (createJob) {
      return {
        state: createJob.state.toLowerCase(),
        label: getReadableCreateStatus(createJob),
        progress: getCreateProgress(createJob),
        type: "create",
      };
    }
    return null;
  }, [
    extractJob,
    createJob,
    getReadableExtractStatus,
    getExtractProgress,
    getReadableCreateStatus,
    getCreateProgress,
  ]);

  if (!job) return null;

  const isActive = ACTIVE_STATES.has(job.state);
  const isCompleted = job.state === "completed";
  const isFailed = job.state === "failed";
  const isCancelled = job.state === "cancelled";
  const isTerminal = TERMINAL_STATES.has(job.state);

  if (variant === "grid") {
    return (
      <div
        className={cn(
          "absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 px-3 transition-opacity duration-300",
          isActive && "bg-black/60 backdrop-blur-[2px]",
          isCompleted && "bg-emerald-950/50 backdrop-blur-[2px]",
          isFailed && "bg-red-950/50 backdrop-blur-[2px]",
          isCancelled && "bg-neutral-950/50 backdrop-blur-[2px]",
        )}
      >
        <StatusIcon
          state={job.state}
          type={job.type}
          isActive={isActive}
          className="size-7 drop-shadow"
        />

        {isActive && job.progress !== null ? (
          <div className="w-3/4 max-w-[120px]">
            <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-white/90 transition-all duration-500 ease-out"
                style={{ width: `${job.progress}%` }}
              />
            </div>
            <div className="text-[10px] text-white/80 text-center mt-1">
              %{job.progress}
            </div>
          </div>
        ) : isActive ? (
          <div className="w-3/4 max-w-[120px]">
            <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
              <div className="h-full w-1/3 rounded-full bg-white/70 animate-indeterminate" />
            </div>
          </div>
        ) : null}

        <div className="text-[11px] text-white/90 text-center truncate max-w-[90%] drop-shadow-sm">
          {job.label}
        </div>
      </div>
    );
  }

  // List variant
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <StatusIcon
        state={job.state}
        type={job.type}
        isActive={isActive}
        className="size-3.5 shrink-0"
      />

      <div className="flex-1 min-w-0 flex items-center gap-2">
        {isActive ? (
          <div className="flex-1 min-w-0">
            <div className="h-1.5 w-full max-w-[160px] rounded-full bg-muted/40 overflow-hidden">
              {job.progress !== null ? (
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500 ease-out",
                    isTerminal ? "bg-muted-foreground/50" : "bg-primary/70",
                  )}
                  style={{ width: `${job.progress}%` }}
                />
              ) : (
                <div className="h-full w-1/3 rounded-full bg-primary/60 animate-indeterminate" />
              )}
            </div>
          </div>
        ) : null}

        <span
          className={cn(
            "text-[11px] truncate shrink-0",
            isCompleted && "text-emerald-600 dark:text-emerald-400",
            isFailed && "text-destructive",
            isCancelled && "text-muted-foreground",
            isActive && "text-muted-foreground",
          )}
        >
          {job.label}
          {isActive && job.progress !== null ? ` (%${job.progress})` : ""}
        </span>
      </div>
    </div>
  );
};

function StatusIcon({
  state,
  type,
  isActive,
  className,
}: {
  state: string;
  type: "extract" | "create";
  isActive: boolean;
  className?: string;
}) {
  if (isActive) {
    return <Loader2 className={cn(className, "animate-spin text-white/80")} />;
  }
  if (state === "completed") {
    return (
      <CheckCircle2
        className={cn(className, "text-emerald-400 dark:text-emerald-300")}
      />
    );
  }
  if (state === "failed") {
    return (
      <XCircle className={cn(className, "text-red-400 dark:text-red-300")} />
    );
  }
  if (state === "cancelled") {
    return (
      <XCircle
        className={cn(className, "text-neutral-400 dark:text-neutral-300")}
      />
    );
  }
  return type === "extract" ? (
    <Archive className={cn(className, "text-muted-foreground")} />
  ) : (
    <PackagePlus className={cn(className, "text-muted-foreground")} />
  );
}
