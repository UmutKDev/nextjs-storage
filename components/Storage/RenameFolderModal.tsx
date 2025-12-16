"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type RenameFolderModalProps = {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => Promise<void> | void;
  loading?: boolean;
  currentName?: string;
  isEncrypted?: boolean;
};

export default function RenameFolderModal({
  open,
  onClose,
  value,
  onChange,
  onSubmit,
  loading,
  currentName,
  isEncrypted,
}: RenameFolderModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="absolute inset-0 z-30 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/30 rounded-md" onClick={onClose} />

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 6, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="relative z-40 w-[min(520px,96%)] max-w-full rounded-md border bg-card p-5 shadow-xl space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">Klasörü Yeniden Adlandır</div>
                {currentName ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    Mevcut ad: <span className="font-medium">{currentName}</span>
                  </p>
                ) : null}
              </div>
              <button
                className="rounded p-1 hover:bg-muted/10"
                onClick={onClose}
                aria-label="Kapat"
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Yeni klasör adı"
                disabled={loading}
                onKeyDown={(evt) => {
                  if (evt.key === "Enter") onSubmit();
                  if (evt.key === "Escape") onClose();
                }}
              />

              {isEncrypted ? (
                <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <Shield className="h-3.5 w-3.5" />
                  Bu klasör şifreli. Yeniden adlandırmak için parola doğrulaması
                  gereklidir.
                </div>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={loading}
                >
                  İptal
                </Button>
                <Button size="sm" onClick={onSubmit} disabled={loading}>
                  {loading ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
