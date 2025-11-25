"use client";

import React from "react";
import { motion } from "framer-motion";
import { useStorage } from "./StorageProvider";
import { ChevronRight } from "lucide-react";

type Crumb = { Name?: string; Path?: string; Type?: string };

export default function Breadcrumb({ items }: { items?: Crumb[] }) {
  const { setCurrentPath, currentPath } = useStorage();
  // Helper that builds a breadcrumb list using the currentPath when the API doesn't provide full crumbs
  const buildFromPath = (path?: string) => {
    const normalized =
      path === "/" || !path ? "" : path.replace(/^\/+|\/+$/g, "");

    const crumbs: Crumb[] = [];
    // root
    crumbs.push({ Name: "root", Path: "", Type: "ROOT" });

    if (!normalized) return crumbs;

    const segments = normalized.split("/");
    let acc = "";
    for (const seg of segments) {
      acc = acc ? `${acc}/${seg}` : seg;
      crumbs.push({ Name: seg, Path: acc, Type: "SUBFOLDER" });
    }

    return crumbs;
  };

  // Determine breadcrumb source: use API items when it provides more than one item (full trail), otherwise build from currentPath
  const useItems =
    items && items.length > 0 ? items : buildFromPath(currentPath);

  return (
    <nav
      aria-label="breadcrumb"
      className="flex items-center gap-2 text-sm text-muted-foreground"
    >
      {useItems.map((it, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12, delay: idx * 0.02 }}
          className="flex items-center gap-2"
        >
          <div className="flex items-center gap-2">
            {it.Type === "ROOT" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                className="text-muted-foreground"
                aria-hidden
              >
                <path
                  d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z"
                  fill="currentColor"
                />
              </svg>
            )}

            <button
              onClick={() => setCurrentPath(it.Path ?? "")}
              className="hover:underline text-sm text-muted-foreground"
              aria-current={idx === useItems.length - 1 ? "page" : undefined}
            >
              {it.Name || "root"}
            </button>
          </div>

          {idx !== useItems.length - 1 && (
            <ChevronRight size={14} className="text-muted-foreground" />
          )}
        </motion.div>
      ))}
    </nav>
  );
}
