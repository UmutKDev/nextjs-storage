"use client";

import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cloudApiFactory } from "@/Service/Factories";
import type { CloudObjectModel } from "@/Service/Generates/api";

export default function ShareFileModal({
  open,
  onClose,
  file,
}: {
  open: boolean;
  onClose: () => void;
  file?: CloudObjectModel | null;
}) {
  // Lock scroll while modal is open
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

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const [loading, setLoading] = React.useState(false);
  const [duration, setDuration] = React.useState("60");
  const [unit, setUnit] = React.useState("minutes");
  const [generatedUrl, setGeneratedUrl] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  // Reset state when modal opens
  React.useEffect(() => {
    if (open) {
      setGeneratedUrl("");
      setDuration("60");
      setUnit("minutes");
      setCopied(false);
    }
  }, [open]);

  const handleGenerate = async () => {
    if (!file?.Path?.Key) return;
    setLoading(true);
    try {
      let expiresInSeconds = parseInt(duration);
      if (isNaN(expiresInSeconds) || expiresInSeconds <= 0) {
        toast.error("Please enter a valid duration");
        setLoading(false);
        return;
      }

      if (unit === "hours") expiresInSeconds *= 60 * 60;
      else if (unit === "days") expiresInSeconds *= 24 * 60 * 60;
      else expiresInSeconds *= 60; // minutes

      const response = await cloudApiFactory.getPresignedUrl({
        key: file.Path.Key,
        expiresInSeconds: expiresInSeconds,
      });

      // Assuming the response data is the URL string
      if (response.data && typeof response.data === "string") {
        setGeneratedUrl(response.data);
      } else if (response.data && response.data) {
        setGeneratedUrl(response.data.result);
      } else {
        // Fallback: try to cast response.data to string if it's not null
        if (response.data) {
          setGeneratedUrl(response.data);
        } else {
          toast.error("Received empty response from server");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate link");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) return null;

  const modal = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] grid place-items-center p-4 sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-xl bg-card border border-border shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2 font-semibold">
                <Share2 className="h-5 w-5" />
                Share File
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1 hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>File</Label>
                <div className="text-sm text-muted-foreground truncate bg-muted/30 p-2 rounded border border-border">
                  {file?.Metadata?.Originalfilename ?? file?.Name}
                </div>
              </div>

              {!generatedUrl ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Input
                        type="number"
                        min="1"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 w-full">
                      <Label>Unit</Label>
                      <Select value={unit} onValueChange={setUnit}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-70 w-full">
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={loading}
                  >
                    {loading ? "Generating..." : "Generate Link"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                  <Label>Share Link</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={generatedUrl}
                      className="font-mono text-xs"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={copyToClipboard}
                      className="shrink-0"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    This link will expire in {duration} {unit}.
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full text-xs"
                    onClick={() => setGeneratedUrl("")}
                  >
                    Generate New Link
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
