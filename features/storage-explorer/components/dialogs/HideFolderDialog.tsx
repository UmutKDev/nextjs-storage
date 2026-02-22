"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EyeOff, X } from "lucide-react";
import { cloudDirectoriesApiFactory } from "@/Service/Factories";
import { useQueryClient } from "@tanstack/react-query";
import { CLOUD_DIRECTORIES_QUERY_KEY } from "@/hooks/useCloudList";
import { isAxiosError } from "axios";
import type { CloudDirectoryModel } from "@/Service/Generates/api";

type HideFolderDialogProps = {
  open: boolean;
  payload: { directory: CloudDirectoryModel } | null;
  onClose: () => void;
};

const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; title?: string }
      | undefined;
    return data?.message || data?.title || error.message;
  }
  if (error instanceof Error) return error.message;
  return "Klasör gizlenemedi.";
};

export default function HideFolderDialog({
  open,
  payload,
  onClose,
}: HideFolderDialogProps) {
  const [passphrase, setPassphrase] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const queryClient = useQueryClient();

  const folderName =
    payload?.directory?.Name || payload?.directory?.Prefix || "";
  const folderPath =
    payload?.directory?.Prefix?.replace(/^\/+|\/+$/g, "") || "";

  React.useEffect(() => {
    if (open) {
      setPassphrase("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!passphrase.trim() || passphrase.length < 8) {
      setError("Parola en az 8 karakter olmalı.");
      return;
    }

    setLoading(true);
    try {
      await cloudDirectoriesApiFactory.directoryHide({
        xFolderPassphrase: passphrase,
        directoryHideRequestModel: { Path: folderPath || "/" },
      });
      await queryClient.invalidateQueries({
        queryKey: CLOUD_DIRECTORIES_QUERY_KEY,
      });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && payload ? (
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
                <div className="text-sm font-semibold">Klasörü gizle</div>
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
                void handleSubmit();
              }}
            >
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {folderName}
                </span>{" "}
                klasörünü gizlemek için bir parola belirleyin. Bu parolayı
                kaybederseniz klasöre erişemezsiniz.
              </p>

              <Input
                id="hide-folder-passphrase"
                name="password"
                type="password"
                value={passphrase}
                placeholder="Parola (en az 8 karakter)"
                autoComplete="new-password"
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
                  {loading ? "Gizleniyor..." : "Gizle"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
