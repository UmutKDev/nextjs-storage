"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EyeOff, X } from "lucide-react";

interface RevealHiddenFolderModalProps {
  open: boolean;
  folderName?: string;
  onClose: () => void;
  onSubmit: (passphrase: string) => Promise<void>;
}

export default function RevealHiddenFolderModal({
  open,
  folderName,
  onClose,
  onSubmit,
}: RevealHiddenFolderModalProps) {
  const [passphrase, setPassphrase] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setPassphrase("");
      setError(null);
    }
  }, [open]);

  const handleReveal = async () => {
    if (!passphrase.trim()) {
      setError("Parola gerekli.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(passphrase);
      setPassphrase("");
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gizli klasörler gösterilemedi.",
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
                <EyeOff className="text-primary" />
                <div className="text-sm font-semibold">
                  Gizli klasörleri göster
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
                void handleReveal();
              }}
            >
              <p className="text-muted-foreground">
                Gizli klasörleri görmek için parolanızı girin{" "}
                <span className="font-semibold text-foreground">
                  {folderName ?? "bu dizin"}
                </span>
                . Oturum süresince geçerlidir.
              </p>

              <Input
                id="hidden-folder-passphrase"
                name="password"
                type="password"
                value={passphrase}
                placeholder="Parola (en az 8 karakter)"
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  type="button"
                >
                  İptal
                </Button>
                <Button size="sm" type="submit" disabled={loading}>
                  {loading ? "Gösteriliyor..." : "Göster"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
