"use client";

import React from "react";
import { Lock, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BaseDialog from "./BaseDialog";

type ConvertToEncryptedModalProps = {
  open: boolean;
  folderName?: string;
  passphrase: string;
  onPassphraseChange: (value: string) => void;
  onSubmit: () => Promise<void> | void;
  onClose: () => void;
  loading?: boolean;
};

export default function ConvertToEncryptedModal({
  open,
  folderName,
  passphrase,
  onPassphraseChange,
  onSubmit,
  onClose,
  loading,
}: ConvertToEncryptedModalProps) {
  return (
    <BaseDialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Şifreli Klasöre Dönüştür
            </div>
            {folderName ? (
              <p className="text-xs text-muted-foreground">
                Hedef klasör:{" "}
                <span className="font-medium text-foreground">
                  {folderName}
                </span>
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Bu işlem seçilen klasörü istemci tarafında şifrelenmiş olarak
              işaretler. Parolayı güvenle saklayın; kaybolursa içerikler
              kurtarılamaz.
            </p>
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

        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground">
            Parola (en az 8 karakter)
          </label>
          <Input
            type="password"
            placeholder="Parola"
            value={passphrase}
            onChange={(e) => onPassphraseChange(e.target.value)}
            disabled={loading}
            autoFocus
            onKeyDown={(event) => {
              if (event.key === "Enter") onSubmit();
              if (event.key === "Escape") onClose();
            }}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Vazgeç
          </Button>
          <Button size="sm" onClick={onSubmit} disabled={loading}>
            {loading ? "Dönüştürülüyor..." : "Dönüştür"}
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
}
