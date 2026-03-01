"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Lock } from "lucide-react";

interface CreateEncryptedFolderModalProps {
  open: boolean;
  onClose: () => void;
  folderName: string;
  onFolderNameChange: (value: string) => void;
  passphrase: string;
  onPassphraseChange: (value: string) => void;
  onSubmit: () => Promise<void> | void;
  loading?: boolean;
}

export default function CreateEncryptedFolderModal({
  open,
  onClose,
  folderName,
  onFolderNameChange,
  passphrase,
  onPassphraseChange,
  onSubmit,
  loading,
}: CreateEncryptedFolderModalProps) {
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
            className="relative z-30 w-[min(520px,96%)] max-w-full rounded-lg border bg-card p-5 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Lock className="w-4 h-4 text-primary" />
                Create Encrypted Folder
              </div>
              <button
                onClick={onClose}
                className="rounded p-1 hover:bg-muted/10"
              >
                <X />
              </button>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                This folder will require client-side encryption. Make sure you
                remember the password; if lost, contents cannot be accessed.
              </p>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">
                  Folder Name
                </label>
                <Input
                  value={folderName}
                  placeholder="e.g. Secret Files"
                  onChange={(e) => onFolderNameChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSubmit();
                    if (e.key === "Escape") onClose();
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">
                  Password (at least 8 characters)
                </label>
                <Input
                  type="password"
                  value={passphrase}
                  placeholder="Password"
                  onChange={(e) => onPassphraseChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSubmit();
                    if (e.key === "Escape") onClose();
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button size="sm" onClick={onSubmit} disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
