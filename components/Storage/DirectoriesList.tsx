"use client";

import React from "react";
import { Folder } from "lucide-react";
import { motion } from "framer-motion";
import { useStorage } from "./StorageProvider";

type Directory = { Prefix: string };

export default function DirectoriesList({
  directories,
}: {
  directories?: Directory[];
}) {
  const { currentPath, setCurrentPath } = useStorage();

  if (!directories || directories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {directories.map((d, idx) => {
        const prefix = d.Prefix ?? "";
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
              setCurrentPath(currentPath ? `${currentPath}/${name}` : name)
            }
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.16 }}
            className="w-full flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent/30 text-sm text-foreground"
          >
            <Folder className="text-muted-foreground" />
            <div className="flex-1 text-left">{name || prefix}</div>
            <div className="text-xs text-muted-foreground">Folder</div>
          </motion.button>
        );
      })}
    </div>
  );
}
