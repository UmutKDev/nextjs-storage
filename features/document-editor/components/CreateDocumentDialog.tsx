"use client";

import React, { useState, useCallback } from "react";
import BaseDialog from "@/components/Storage/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cloudDocumentsApiFactory } from "@/Service/Factories";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { SUPPORTED_DOCUMENT_EXTENSIONS } from "../utils/extensions";
import type { DocumentResponseModel } from "@/types/document.types";

const EXTENSION_LIST = Array.from(SUPPORTED_DOCUMENT_EXTENSIONS).sort();

export default function CreateDocumentDialog({
  open,
  currentPath,
  onClose,
  onCreated,
}: {
  open: boolean;
  currentPath: string;
  onClose: () => void;
  onCreated?: (doc: DocumentResponseModel) => void;
}) {
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleClose = useCallback(() => {
    setName("");
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;

      // Validate extension
      const dotIdx = name.lastIndexOf(".");
      if (dotIdx === -1 || dotIdx === name.length - 1) {
        toast.error("Please include a file extension (e.g., readme.md)");
        return;
      }

      setIsCreating(true);
      try {
        const res = await cloudDocumentsApiFactory.create({
          documentCreateRequestModel: {
            Path: currentPath,
            Name: name.trim(),
          },
        });
        const result = res.data?.Result as DocumentResponseModel;
        toast.success(`Created ${name.trim()}`);
        setName("");
        onCreated?.(result);
        onClose();
      } catch {
        toast.error("Failed to create document");
      } finally {
        setIsCreating(false);
      }
    },
    [name, currentPath, onClose, onCreated],
  );

  return (
    <BaseDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
      }}
      panelClassName="relative z-10 max-w-md w-full bg-card border border-border shadow-2xl rounded-xl p-6"
      overlayClassName="absolute inset-0 bg-black/50 backdrop-blur-sm"
      containerClassName="fixed inset-0 z-50 grid place-items-center p-4"
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="flex flex-col gap-4"
      >
        <h3 className="text-sm font-semibold text-foreground">
          Create Document
        </h3>
        <p className="text-xs text-muted-foreground">
          Supported extensions: {EXTENSION_LIST.slice(0, 8).join(", ")}...
        </p>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="filename.md"
          autoFocus
          disabled={isCreating}
        />
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isCreating || !name.trim()}>
            {isCreating && <Loader2 size={14} className="animate-spin mr-1" />}
            Create
          </Button>
        </div>
      </form>
    </BaseDialog>
  );
}
