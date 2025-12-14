"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, ArrowLeft, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCloudList } from "@/hooks/useCloudList";

interface MoveFileModalProps {
  open: boolean;
  onClose: () => void;
  sourceKeys: string[];
  onMove: (sourceKeys: string[], destinationKey: string) => Promise<void>;
  initialPath?: string;
}

export default function MoveFileModal({
  open,
  onClose,
  sourceKeys,
  onMove,
  initialPath = "",
}: MoveFileModalProps) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [manualPath, setManualPath] = useState("");
  const [isManual, setIsManual] = useState(false);
  const [moving, setMoving] = useState(false);

  // Fetch directories for the current path
  const { directoriesQuery } = useCloudList(currentPath, {
    enabled: open && !isManual,
    take: 100,
  });

  const directories = directoriesQuery.data?.items || [];
  const isLoading = directoriesQuery.isLoading;

  useEffect(() => {
    if (open) {
      setCurrentPath(initialPath);
      setManualPath("");
      setIsManual(false);
    }
  }, [open, initialPath]);

  const handleNavigate = (dirName: string) => {
    const newPath = currentPath ? `${currentPath}/${dirName}` : dirName;
    setCurrentPath(newPath);
  };

  const handleNavigateUp = () => {
    if (!currentPath) return;
    const segments = currentPath.split("/").filter(Boolean);
    segments.pop();
    setCurrentPath(segments.join("/"));
  };

  const handleConfirm = async () => {
    const destination = isManual ? manualPath : currentPath;
    setMoving(true);
    try {
      await onMove(sourceKeys, destination);
      onClose();
    } catch (error) {
      console.error("Move failed", error);
    } finally {
      setMoving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative z-50 w-[500px] max-w-[90%] bg-card border rounded-lg shadow-xl flex flex-col max-h-[80vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                Move {sourceKeys.length} item{sourceKeys.length > 1 ? "s" : ""}
              </h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden flex flex-col p-4 gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={!isManual ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setIsManual(false)}
                  className="flex-1"
                >
                  Browse
                </Button>
                <Button
                  variant={isManual ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setIsManual(true)}
                  className="flex-1"
                >
                  Enter Path
                </Button>
              </div>

              {isManual ? (
                <div className="py-8">
                  <label className="text-sm font-medium mb-2 block">
                    Destination Path
                  </label>
                  <Input
                    value={manualPath}
                    onChange={(e) => setManualPath(e.target.value)}
                    placeholder="e.g. Documents/Work"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter the exact folder path where you want to move the
                    items.
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0 border rounded-md">
                  <div className="p-2 border-b bg-muted/30 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={!currentPath}
                      onClick={handleNavigateUp}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium truncate flex-1">
                      /{currentPath}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {isLoading ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : directories.length === 0 ? (
                      <div className="text-center text-sm text-muted-foreground p-4">
                        No folders found
                      </div>
                    ) : (
                      directories.map((dir) => {
                        const name =
                          dir.Prefix?.split("/").filter(Boolean).pop() || "";
                        return (
                          <button
                            key={dir.Prefix}
                            onClick={() => handleNavigate(name)}
                            className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-sm text-sm text-left"
                          >
                            <Folder className="h-4 w-4 text-blue-500 fill-blue-500/20" />
                            <span className="truncate">{name}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={onClose} disabled={moving}>
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={moving}>
                {moving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Move Here
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
