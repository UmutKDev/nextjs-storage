"use client";

import React from "react";
import { Folder } from "lucide-react";
import { motion } from "framer-motion";
import { useStorage } from "./StorageProvider";
import { CloudDirectoryModel } from "@/Service/Generates";

export default function DirectoriesList({
  directories,
  loading = false,
  skeletonCount = 4,
}: {
  directories?: CloudDirectoryModel[];
  loading?: boolean;
  skeletonCount?: number;
}) {
  const { currentPath, setCurrentPath } = useStorage();

  if ((!directories || directories.length === 0) && !loading) {
    return null;
  }

  return (
    <div className="space-y-2">
      {(loading
        ? Array.from({ length: skeletonCount })
        : directories ?? []
      ).map((d: unknown, idx) => {
        const dir = d as CloudDirectoryModel | undefined;
        const prefix = dir?.Prefix ?? "";
        // display name is last non-empty segment
        const segments = prefix.split("/").filter(Boolean);
        const name = segments.length
          ? segments[segments.length - 1]
          : prefix || "";

        return (
          <motion.button
            layout
            key={prefix || idx}
            onClick={() =>
              // disable clicks while loading
              !loading &&
              setCurrentPath(currentPath ? `${currentPath}/${name}` : name)
            }
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.16 }}
            className={`w-full flex items-center gap-3 rounded-md px-3 py-2 ${
              loading
                ? "opacity-60 cursor-default"
                : "hover:bg-accent/30 cursor-pointer"
            } text-sm text-foreground`}
          >
            <Folder className="text-muted-foreground" />
            <div className="flex-1 text-left">
              {loading ? (
                <div className="h-3 w-28 rounded bg-muted/30 animate-pulse" />
              ) : (
                name || prefix
              )}
            </div>
            <div className="text-xs text-muted-foreground">Folder</div>
          </motion.button>
        );
      })}
    </div>
  );
}
