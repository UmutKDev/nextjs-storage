"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateFolderModal({
  open,
  onClose,
  value,
  onChange,
  onSubmit,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => Promise<void> | void;
  loading?: boolean;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/30 rounded-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 6, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="relative z-30 w-[min(520px,96%)] max-w-full rounded-md border bg-card p-4 shadow-lg"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="text-sm font-semibold">Create new folder</div>
              <button
                onClick={onClose}
                className="rounded p-1 hover:bg-muted/10"
              >
                <X />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Folder name"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSubmit();
                  if (e.key === "Escape") onClose();
                }}
              />

              <div className="flex gap-2">
                <Button size="sm" onClick={onSubmit} disabled={loading}>
                  Create
                </Button>
                <Button size="sm" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
