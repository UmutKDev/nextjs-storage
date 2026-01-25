"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, X } from "lucide-react";

interface UnlockEncryptedFolderModalProps {
  open: boolean;
  folderName?: string;
  onClose: () => void;
  onSubmit: (passphrase: string) => Promise<void>;
}

export default function UnlockEncryptedFolderModal({
  open,
  folderName,
  onClose,
  onSubmit,
}: UnlockEncryptedFolderModalProps) {
  const [passphrase, setPassphrase] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setPassphrase("");
      setError(null);
    }
  }, [open]);

  const handleUnlock = async () => {
    if (!passphrase.trim()) {
      setError("Passphrase is required.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(passphrase);
      setPassphrase("");
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to unlock the encrypted folder."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 md:py-8"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-10 w-[95vw] max-w-md rounded-xl bg-card border border-border shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-muted/10">
              <div className="flex items-center gap-2">
                <Lock className="text-primary" />
                <div className="text-sm font-semibold">
                  Unlock encrypted folder
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1 hover:bg-muted/10"
              >
                <X />
              </button>
            </div>

            <form
              className="p-4 space-y-3 text-sm"
              autoComplete="off"
              onSubmit={(event) => {
                event.preventDefault();
                void handleUnlock();
              }}
            >
              <p className="text-muted-foreground">
                Enter the passphrase to unlock{" "}
                <span className="font-semibold text-foreground">
                  {folderName ?? "this folder"}
                </span>
                . The folder key is kept only in memory for this session.
              </p>

              <Input
                id="folder-passphrase"
                name="password"
                type="password"
                value={passphrase}
                placeholder="Passphrase"
                autoComplete="current-password"
                autoFocus
                onChange={(e) => setPassphrase(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") onClose();
                }}
              />

              {error ? (
                <div className="text-xs text-destructive">{error}</div>
              ) : null}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-muted/10">
                <Button variant="ghost" size="sm" onClick={onClose} type="button">
                  Cancel
                </Button>
                <Button size="sm" type="submit" disabled={loading}>
                  {loading ? "Unlocking..." : "Unlock"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
