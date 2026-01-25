"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import BaseDialog from "./BaseDialog";

export default function CreateFolderModal({
  open,
  onClose,
  value,
  onChange,
  onSubmit,
  loading,
  isEncrypted,
  onIsEncryptedChange,
  passphrase,
  onPassphraseChange,
}: {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => Promise<void> | void;
  loading?: boolean;
  isEncrypted?: boolean;
  onIsEncryptedChange?: (v: boolean) => void;
  passphrase?: string;
  onPassphraseChange?: (v: string) => void;
}) {
  return (
    <BaseDialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">Create new folder</div>
          <button onClick={onClose} className="rounded p-1 hover:bg-muted/10">
            <X />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Folder name"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSubmit();
                if (e.key === "Escape") onClose();
              }}
            />
          </div>

          {onIsEncryptedChange && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="encrypted"
                checked={isEncrypted}
                onCheckedChange={(checked) =>
                  onIsEncryptedChange(checked === true)
                }
              />
              <label
                htmlFor="encrypted"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Şifrele
              </label>
            </div>
          )}

          {isEncrypted && onPassphraseChange && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Input
                type="password"
                placeholder="Parola (en az 8 karakter)"
                value={passphrase}
                onChange={(e) => onPassphraseChange(e.target.value)}
                className="mt-2"
              />
            </motion.div>
          )}

          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={onSubmit} disabled={loading}>
              Create
            </Button>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
}
