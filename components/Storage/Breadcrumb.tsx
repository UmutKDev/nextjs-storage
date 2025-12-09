"use client";

import React from "react";
import { motion } from "framer-motion";
import { useStorage } from "./StorageProvider";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";

type Crumb = { Name?: string; Path?: string; Type?: string };

function DroppableCrumb({ 
  item, 
  isLast, 
  isRoot, 
  onClick 
}: { 
  item: Crumb; 
  isLast: boolean; 
  isRoot: boolean; 
  onClick: () => void; 
}) {
  // Use the path as the droppable ID. 
  // If it's root, path is empty string.
  const { setNodeRef, isOver } = useDroppable({
    id: item.Path ?? "",
    data: { type: "folder", path: item.Path ?? "" },
    disabled: isLast, // Can't drop on the current folder (it's already there)
  });

  return (
    <div ref={setNodeRef} className="relative">
      <button
        onClick={onClick}
        disabled={isLast}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200",
          isLast 
            ? "bg-primary/10 text-primary font-semibold cursor-default" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer",
          isOver && !isLast && "bg-primary/20 ring-2 ring-primary ring-inset text-primary"
        )}
        aria-current={isLast ? "page" : undefined}
      >
        {isRoot ? (
          <Home className="w-4 h-4" />
        ) : (
          <span>{item.Name}</span>
        )}
      </button>
    </div>
  );
}

export default function Breadcrumb({ items }: { items?: Crumb[] }) {
  const { setCurrentPath, currentPath } = useStorage();

  const buildFromPath = (path?: string) => {
    const normalized =
      path === "/" || !path ? "" : path.replace(/^\/+|\/+$/g, "");

    const crumbs: Crumb[] = [];
    crumbs.push({ Name: "Ana Dizin", Path: "", Type: "ROOT" });

    if (!normalized) return crumbs;

    const segments = normalized.split("/");
    let acc = "";
    for (const seg of segments) {
      acc = acc ? `${acc}/${seg}` : seg;
      crumbs.push({ Name: seg, Path: acc, Type: "SUBFOLDER" });
    }

    return crumbs;
  };

  const useItems =
    items && items.length > 0 ? items : buildFromPath(currentPath);

  return (
    <nav
      aria-label="breadcrumb"
      className="flex items-center px-1 py-1"
    >
      <ol className="flex items-center flex-wrap gap-1.5 text-sm">
        {useItems.map((it, idx) => {
          const isLast = idx === useItems.length - 1;
          const isRoot = it.Type === "ROOT" || idx === 0;

          return (
            <motion.li
              key={it.Path || idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className="flex items-center gap-1.5"
            >
              <DroppableCrumb 
                item={it} 
                isLast={isLast} 
                isRoot={isRoot} 
                onClick={() => setCurrentPath(it.Path ?? "")} 
              />

              {!isLast && (
                <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
              )}
            </motion.li>
          );
        })}
      </ol>
    </nav>
  );
}
