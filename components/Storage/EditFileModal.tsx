"use client";

import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit3, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";

export default function EditFileModal({
  open,
  onClose,
  file,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  file?: any | null;
  onConfirm: (payload: {
    name: string;
    metadata: Record<string, string>;
  }) => Promise<void> | void;
}) {
  // lock scroll while modal open
  React.useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight || "";
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0)
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const [saving, setSaving] = React.useState(false);
  const [name, setName] = React.useState("");
  // use stable ids for each pair so react doesn't recreate inputs while typing
  const [pairs, setPairs] = React.useState<
    Array<{ id: string; key: string; value: string }>
  >([]);
  const idCounter = React.useRef(0);

  React.useEffect(() => {
    if (!open) return;
    setSaving(false);
    // Prefer safe Name (no extension). If Originalfilename exists, strip its extension if it matches file.Extension
    const rawOriginal = file?.Metadata?.Originalfilename ?? file?.Name ?? "";
    const ext = file?.Extension
      ? String(file.Extension).replace(/^\./, "")
      : "";
    let initialName = String(rawOriginal ?? "");
    if (ext && initialName.endsWith(`.${ext}`)) {
      initialName = initialName.slice(0, -1 - ext.length);
    }
    setName(String(initialName));
    const meta = file?.Metadata ?? {};
    // Hide default model metadata fields from the editable list
    const DEFAULT_KEYS = ["Originalfilename", "Width", "Height"];
    const keys = Object.keys(meta || {}).filter(
      (k) => !DEFAULT_KEYS.includes(k)
    );
    if (keys.length === 0) setPairs([]);
    else
      setPairs(
        keys.map((k) => ({
          id: String(idCounter.current++),
          key: k,
          value: String(meta[k]),
        }))
      );
  }, [open, file]);

  async function handleSubmit() {
    // validate name
    if (!name || !name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    if (!file) return onClose();
    setSaving(true);
    const metadata: Record<string, string> = {};
    for (const p of pairs) {
      if (!p.key) continue; // skip empty key
      metadata[p.key] = p.value ?? "";
    }

    // make sure name doesn't contain extension — strip a trailing .ext if present
    const ext = file?.Extension
      ? String(file.Extension).replace(/^\./, "")
      : "";
    let finalName = name?.trim();
    if (ext && finalName?.toLowerCase().endsWith(`.${ext.toLowerCase()}`)) {
      finalName = finalName.slice(0, -1 - ext.length);
    }

    try {
      await onConfirm({ name: finalName?.trim(), metadata });
    } finally {
      setSaving(false);
      onClose();
    }
  }

  if (!open) return null;

  const modal = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-50 grid place-items-center px-4 py-6 md:py-8"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
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
          className="relative z-10 w-[95vw] max-w-2xl rounded-xl bg-card border border-border shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-muted/10">
            <div className="flex items-center gap-2">
              <Edit3 />
              <div className="text-sm font-semibold">Edit file</div>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 hover:bg-muted/10"
            >
              <X />
            </button>
          </div>

          <div className="p-4">
            <div className="text-sm text-muted-foreground mb-2">
              Filename (without extension)
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="text-xs text-muted-foreground rounded border border-border px-2 py-1 bg-muted/10">
                .
                {file?.Extension ??
                  file?.Metadata?.Originalfilename?.split(".").pop() ??
                  ""}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Metadata (key ↔ value)
              </div>
              <button
                onClick={() =>
                  setPairs((s) => [
                    ...s,
                    { id: String(idCounter.current++), key: "", value: "" },
                  ])
                }
                className="inline-flex items-center gap-2 rounded px-2 py-1 text-xs hover:bg-muted/10"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            <div className="mt-2 space-y-2">
              {pairs.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  No metadata set
                </div>
              ) : (
                pairs.map((p, idx) => (
                  <div key={p.id} className="flex gap-2">
                    <div className="w-1/2">
                      <Input
                        placeholder="Key"
                        value={p.key}
                        onChange={(e) =>
                          setPairs((s) =>
                            s.map((r) =>
                              r.id === p.id ? { ...r, key: e.target.value } : r
                            )
                          )
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Value"
                        value={p.value}
                        onChange={(e) =>
                          setPairs((s) =>
                            s.map((r) =>
                              r.id === p.id
                                ? { ...r, value: e.target.value }
                                : r
                            )
                          )
                        }
                      />
                    </div>
                    <div>
                      <button
                        aria-label="Remove metadata"
                        onClick={() =>
                          setPairs((s) => s.filter((r) => r.id !== p.id))
                        }
                        className="rounded p-1 hover:bg-muted/10 text-destructive"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-4 border-t border-muted/10">
            <button
              onClick={onClose}
              className="rounded-md px-3 py-1 text-sm hover:bg-muted/10"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="rounded-md px-3 py-1 text-sm bg-primary text-primary-foreground hover:opacity-95"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
