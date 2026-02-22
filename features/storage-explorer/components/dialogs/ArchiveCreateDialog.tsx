"use client";

import React from "react";
import { Archive, X } from "lucide-react";
import BaseDialog from "@/components/Storage/BaseDialog";
import { Input } from "@/components/ui/input";
import { useExplorerActions } from "../../contexts/ExplorerActionsContext";
import { CloudArchiveCreateStartRequestModelFormatEnum } from "@/Service/Generates/api";

type ArchiveCreateDialogProps = {
  open: boolean;
  payload: { keys: string[] } | null;
  onClose: () => void;
};

const FORMAT_OPTIONS: {
  value: CloudArchiveCreateStartRequestModelFormatEnum;
  label: string;
}[] = [
  { value: CloudArchiveCreateStartRequestModelFormatEnum.Zip, label: ".zip" },
  { value: CloudArchiveCreateStartRequestModelFormatEnum.Tar, label: ".tar" },
  {
    value: CloudArchiveCreateStartRequestModelFormatEnum.TarGz,
    label: ".tar.gz",
  },
];

export default function ArchiveCreateDialog({
  open,
  payload,
  onClose,
}: ArchiveCreateDialogProps) {
  const { startArchiveCreation } = useExplorerActions();
  const [format, setFormat] =
    React.useState<CloudArchiveCreateStartRequestModelFormatEnum>(
      CloudArchiveCreateStartRequestModelFormatEnum.Zip,
    );
  const [outputName, setOutputName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const keys = payload?.keys ?? [];

  React.useEffect(() => {
    if (open) {
      setFormat(CloudArchiveCreateStartRequestModelFormatEnum.Zip);
      setOutputName("");
    }
  }, [open]);

  const handleCreate = React.useCallback(async () => {
    if (keys.length === 0) return;
    setLoading(true);
    try {
      await startArchiveCreation(keys, format, outputName.trim() || undefined);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [keys, format, outputName, startArchiveCreation, onClose]);

  return (
    <BaseDialog
      open={open && keys.length > 0}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <div className="flex items-center justify-between p-4 border-b border-muted/10">
        <div className="flex items-center gap-2">
          <Archive className="text-primary" />
          <div className="text-sm font-semibold">Arsiv olustur</div>
        </div>
        <button onClick={onClose} className="rounded-md p-1 hover:bg-muted/10">
          <X />
        </button>
      </div>

      <div className="p-4 text-sm space-y-4">
        <div className="text-muted-foreground">
          {keys.length} oge secildi. Bir arsiv dosyasi olusturulacak.
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground">Format</label>
          <div className="flex gap-2">
            {FORMAT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormat(option.value)}
                className={`rounded-md px-3 py-1.5 text-sm border transition-colors ${
                  format === option.value
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border hover:bg-muted/10 text-muted-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground">
            Dosya adi (opsiyonel)
          </label>
          <Input
            value={outputName}
            onChange={(e) => setOutputName(e.target.value)}
            placeholder="Otomatik olusturulacak"
            className="h-8 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Bos birakilirsa sunucu tarafindan otomatik isimlendirilir.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 p-4 border-t border-muted/10">
        <button
          onClick={onClose}
          disabled={loading}
          className="rounded-md px-3 py-1 text-sm hover:bg-muted/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Iptal
        </button>
        <button
          onClick={handleCreate}
          disabled={loading}
          className="rounded-md px-3 py-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <div className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : null}
          Olustur
        </button>
      </div>
    </BaseDialog>
  );
}
