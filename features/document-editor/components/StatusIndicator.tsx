"use client";

import React from "react";
import { DocumentLockStatus } from "@/types/document.types";

export default function StatusIndicator({
  isDirty,
  isSaving,
  lockStatus,
  lockedBy,
  hasDraft,
}: {
  isDirty: boolean;
  isSaving: boolean;
  lockStatus: string;
  lockedBy?: string;
  hasDraft?: boolean;
}) {
  if (isSaving) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-yellow-500">
        <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
        Saving...
      </span>
    );
  }

  if (lockStatus === DocumentLockStatus.LockedByOther) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-500">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Locked by {lockedBy || "another user"}
      </span>
    );
  }

  if (lockStatus === DocumentLockStatus.LockedByMe) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-blue-500">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        Locked by you
      </span>
    );
  }

  if (isDirty) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-orange-500">
        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
        {hasDraft ? "Draft" : "Unsaved changes"}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-green-500">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      Saved
    </span>
  );
}
