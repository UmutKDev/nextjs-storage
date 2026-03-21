"use client";

import React from "react";
import type { DocumentDiffResponseModel } from "@/types/document.types";

export default function DocumentDiffViewer({
  diff,
}: {
  diff: DocumentDiffResponseModel;
}) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground px-1">
        <span className="text-green-500">
          +{diff.Stats?.Additions ?? 0} additions
        </span>
        <span className="text-red-500">
          -{diff.Stats?.Deletions ?? 0} deletions
        </span>
        <span>{diff.Stats?.Changes ?? 0} changes</span>
      </div>

      {/* Hunks */}
      <div className="border border-border rounded-md overflow-hidden font-mono text-xs">
        {diff.Hunks?.map((hunk, hunkIdx) => (
          <div key={hunkIdx}>
            {/* Hunk header */}
            <div className="bg-muted/50 text-muted-foreground px-3 py-1 border-b border-border text-[10px]">
              @@ -{hunk.OldStart},{hunk.OldLines} +{hunk.NewStart},
              {hunk.NewLines} @@
            </div>
            {/* Lines */}
            {hunk.Lines?.map((line, lineIdx) => {
              const prefix = line.charAt(0);
              let bg = "";
              let textColor = "";
              if (prefix === "+") {
                bg = "bg-green-500/10";
                textColor = "text-green-400";
              } else if (prefix === "-") {
                bg = "bg-red-500/10";
                textColor = "text-red-400";
              }
              return (
                <div
                  key={lineIdx}
                  className={`px-3 py-0 leading-5 whitespace-pre-wrap break-all ${bg} ${textColor}`}
                >
                  {line}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
