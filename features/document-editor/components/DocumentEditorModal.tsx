"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  X,
  Maximize2,
  Minimize2,
  Save,
  Lock,
  Unlock,
  Loader2,
  Pencil,
  Eye,
  DownloadCloud,
  Share2,
  Trash2,
} from "lucide-react";
import BaseDialog from "@/components/Storage/BaseDialog";
import OldVersionHistoryPanel from "@/components/Storage/VersionHistoryPanel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CodeMirrorEditor from "./CodeMirrorEditor";
import StatusIndicator from "./StatusIndicator";
import VersionHistoryPanel from "./VersionHistoryPanel";
import UnsavedChangesDialog from "./UnsavedChangesDialog";
import { useDocumentEditor } from "../hooks/useDocumentEditor";
import { useDocumentLock } from "../hooks/useDocumentLock";
import { useDocumentAutoSave } from "../hooks/useDocumentAutoSave";
import { useDocumentVersions } from "../hooks/useDocumentVersions";
import {
  DocumentLockStatus,
  DocumentContentLockStatus,
} from "@/types/document.types";
import type { CloudObjectModel } from "@/Service/Generates/api";
import {
  getCloudObjectUrl,
  getImageCdnUrl,
  getScaledImageDimensions,
  isImageFile,
} from "@/components/Storage/imageCdn";
import { downloadWithRetry } from "@/lib/download";

export default function DocumentEditorModal({
  file,
  onClose,
  onDelete,
  onRestored,
}: {
  file: CloudObjectModel | null;
  onClose: () => void;
  onDelete?: (file: CloudObjectModel) => void;
  onRestored?: () => void;
}) {
  const fileKey = file?.Path?.Key ?? "";
  const fileName = file?.Name ?? "";
  const fileExtension = file?.Extension?.toLowerCase() ?? "";
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [isEditMode, setIsEditMode] = useState(false);

  const editor = useDocumentEditor(fileKey);
  const lock = useDocumentLock(fileKey);
  const versions = useDocumentVersions(fileKey);

  // Auto-save drafts only in edit mode
  useDocumentAutoSave(
    fileKey,
    editor.content,
    editor.isDirty,
    isEditMode &&
      !editor.isReadOnly &&
      lock.lockStatus !== DocumentLockStatus.LockedByOther,
  );

  // Sync lock status from content response
  useEffect(() => {
    if (editor.contentData?.LockStatus) {
      const status = editor.contentData.LockStatus;
      if (status === DocumentContentLockStatus.LockedByMe) {
        lock.setLockStatus(DocumentLockStatus.LockedByMe);
      } else if (status === DocumentContentLockStatus.LockedByOther) {
        lock.setLockStatus(DocumentLockStatus.LockedByOther);
      }
    }
  }, [editor.contentData?.LockStatus, lock]);

  // Keyboard shortcuts (only in edit mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s" && isEditMode) {
        e.preventDefault();
        void editor.save();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor, isEditMode]);

  // beforeunload guard
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (editor.isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [editor.isDirty]);

  const handleClose = useCallback(() => {
    if (editor.isDirty) {
      setShowUnsavedDialog(true);
    } else {
      onClose();
    }
  }, [editor.isDirty, onClose]);

  const handleSaveAndClose = useCallback(async () => {
    await editor.save();
    setShowUnsavedDialog(false);
    onClose();
  }, [editor, onClose]);

  const handleDiscard = useCallback(() => {
    setShowUnsavedDialog(false);
    onClose();
  }, [onClose]);

  const handleEnterEditMode = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const handleExitEditMode = useCallback(() => {
    if (editor.isDirty) {
      setShowUnsavedDialog(true);
    } else {
      setIsEditMode(false);
    }
  }, [editor.isDirty]);

  const handleToggleLock = useCallback(async () => {
    if (lock.lockStatus === DocumentLockStatus.LockedByMe) {
      await lock.releaseLock();
    } else {
      await lock.acquireLock();
    }
  }, [lock]);

  const handleRestore = useCallback(
    async (versionId: string) => {
      const success = await versions.restoreVersion(versionId);
      if (success) {
        await editor.reload();
        onRestored?.();
      }
      return success;
    },
    [versions, editor, onRestored],
  );

  const handleConflictOverwrite = useCallback(async () => {
    await editor.forceSave();
  }, [editor]);

  const handleConflictReload = useCallback(async () => {
    await editor.reload();
  }, [editor]);

  // Handle save conflict (409)
  const handleSave = useCallback(async () => {
    const result = await editor.save();
    if (result?.conflict) {
      const overwrite = window.confirm(
        "This document has been modified by someone else.\n\nClick OK to overwrite with your changes, or Cancel to reload the server version.",
      );
      if (overwrite) {
        await handleConflictOverwrite();
      } else {
        await handleConflictReload();
      }
    }
  }, [editor, handleConflictOverwrite, handleConflictReload]);

  if (!file) return null;

  const lockedByOther =
    editor.isReadOnly || lock.lockStatus === DocumentLockStatus.LockedByOther;

  if (isEditMode) {
    return (
      <EditModeView
        fileName={fileName}
        fileExtension={fileExtension}
        isFullScreen={isFullScreen}
        setIsFullScreen={setIsFullScreen}
        cursorPos={cursorPos}
        setCursorPos={setCursorPos}
        editor={editor}
        lock={lock}
        versions={versions}
        lockedByOther={lockedByOther}
        onClose={handleClose}
        onSave={handleSave}
        onToggleLock={handleToggleLock}
        onExitEditMode={handleExitEditMode}
        onRestore={handleRestore}
        showUnsavedDialog={showUnsavedDialog}
        onSaveAndClose={handleSaveAndClose}
        onDiscard={handleDiscard}
        onCancelUnsaved={() => setShowUnsavedDialog(false)}
      />
    );
  }

  return (
    <ViewModeView
      file={file}
      fileKey={fileKey}
      isFullScreen={isFullScreen}
      setIsFullScreen={setIsFullScreen}
      lockedByOther={lockedByOther}
      content={editor.content}
      isLoading={editor.isLoading}
      isError={editor.isError}
      onClose={onClose}
      onDelete={onDelete}
      onEnterEditMode={handleEnterEditMode}
      onRestored={onRestored}
    />
  );
}

// ─── VIEW MODE (old FilePreviewModal style) ──────────────────────────────────

function ViewModeView({
  file,
  fileKey,
  isFullScreen,
  setIsFullScreen,
  lockedByOther,
  content,
  isLoading,
  isError,
  onClose,
  onDelete,
  onEnterEditMode,
  onRestored,
}: {
  file: CloudObjectModel;
  fileKey: string;
  isFullScreen: boolean;
  setIsFullScreen: (v: boolean) => void;
  lockedByOther: boolean;
  content: string;
  isLoading: boolean;
  isError: boolean;
  onClose: () => void;
  onDelete?: (file: CloudObjectModel) => void;
  onEnterEditMode: () => void;
  onRestored?: () => void;
}) {
  const displayName = file?.Metadata?.Originalfilename ?? file?.Name ?? "";
  const downloadUrl = getCloudObjectUrl(file);
  const downloadFileName =
    file?.Metadata?.Originalfilename || file?.Name || "download";
  const scaledDownloadUrl = getImageCdnUrl(file, {
    target: isFullScreen ? "fullscreen" : "preview",
  });

  const rawWidth = file?.Metadata?.Width ? Number(file.Metadata.Width) : null;
  const rawHeight = file?.Metadata?.Height
    ? Number(file.Metadata.Height)
    : null;
  const hasDimsForScaled =
    rawWidth &&
    rawHeight &&
    Number.isFinite(rawWidth) &&
    Number.isFinite(rawHeight);
  const hasScaledDownload =
    Boolean(downloadUrl) &&
    Boolean(scaledDownloadUrl) &&
    isImageFile(file) &&
    scaledDownloadUrl !== downloadUrl &&
    hasDimsForScaled;

  const handleDownload = useCallback(
    async (url?: string) => {
      if (!url) return;
      try {
        await downloadWithRetry({ url, filename: downloadFileName });
      } catch (error) {
        console.error(error);
      }
    },
    [downloadFileName],
  );

  const handleShare = useCallback(async () => {
    if (!downloadUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: displayName, url: downloadUrl });
        return;
      }
      await navigator.clipboard.writeText(downloadUrl);
    } catch (error) {
      console.error(error);
    }
  }, [downloadUrl, displayName]);

  return (
    <BaseDialog
      open={true}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      containerClassName={`fixed inset-0 z-50 grid place-items-center ${
        isFullScreen ? "p-0" : "p-4 sm:p-6"
      }`}
      overlayClassName="absolute inset-0 bg-black/50 backdrop-blur-sm"
      panelClassName={`relative z-10 flex flex-col overflow-hidden transition-all duration-200 w-full h-full bg-card text-foreground sm:border sm:border-border sm:shadow-2xl ${
        isFullScreen
          ? "sm:rounded-none"
          : "sm:h-auto sm:max-h-[90vh] sm:min-h-[500px] sm:w-[90vw] md:w-[80vw] lg:max-w-4xl sm:rounded-xl"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/40 shrink-0 gap-4 bg-muted/5">
        <div className="flex items-center gap-3 min-w-0 overflow-hidden">
          <div className="flex flex-col min-w-0">
            <div
              className="text-sm font-semibold truncate text-foreground"
              title={file.Metadata?.Originalfilename ?? file.Name}
            >
              {displayName}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="uppercase font-medium tracking-wide text-[10px] bg-muted px-1.5 rounded-sm">
                {file.Extension}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {/* Edit button */}
          <Button
            variant="default"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={onEnterEditMode}
            disabled={lockedByOther}
            title={
              lockedByOther ? "Locked by another user" : "Switch to edit mode"
            }
          >
            <Pencil size={14} />
            Edit
          </Button>

          <div className="h-6 w-px bg-border/60 mx-1" />

          {/* Download */}
          {downloadUrl ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Download"
                >
                  <DownloadCloud size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => void handleDownload(downloadUrl)}
                >
                  Original
                </DropdownMenuItem>
                {hasScaledDownload && (
                  <DropdownMenuItem
                    onClick={() =>
                      void handleDownload(scaledDownloadUrl ?? downloadUrl)
                    }
                  >
                    Scaled
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          {/* Share */}
          {downloadUrl ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Share"
              onClick={() => void handleShare()}
            >
              <Share2 size={18} />
            </Button>
          ) : null}

          <div className="h-6 w-px bg-border/60 mx-1" />

          {/* Delete */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete?.(file)}
            title="Delete"
          >
            <Trash2 size={18} />
          </Button>

          <div className="h-6 w-px bg-border/60 mx-1" />

          {/* Fullscreen */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? "Minimize" : "Full Screen"}
          >
            {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </Button>

          {/* Close */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X size={18} />
          </Button>
        </div>
      </div>

      {/* Content — rendered from editor state */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        <div className="p-0 sm:p-4 overflow-hidden sm:overflow-auto flex-1 flex flex-col">
          <div className="relative overflow-hidden h-full sm:rounded-lg sm:border sm:border-border/50 sm:bg-muted/5">
            <div
              className={`${
                isFullScreen ? "h-[calc(100vh-8rem)]" : "max-h-[60vh]"
              } overflow-auto p-4 custom-scrollbar`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-sm">Loading content...</span>
                </div>
              ) : isError ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                  <span className="text-sm text-destructive">
                    Failed to load content
                  </span>
                </div>
              ) : (
                <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap break-words text-foreground/80">
                  {content || "No content available"}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Version History (old simple panel) */}
      <div className="shrink-0">
        <OldVersionHistoryPanel fileKey={fileKey} onRestored={onRestored} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-4 border-t border-muted/10 text-xs text-muted-foreground shrink-0">
        <div>{formatOriginalSize(file)}</div>
        {formatScaledSize(file, { isFullScreen }) && (
          <div>{formatScaledSize(file, { isFullScreen })}</div>
        )}
        <div>
          Modified:{" "}
          {file.LastModified
            ? new Date(file.LastModified).toLocaleString()
            : "\u2014"}
        </div>
      </div>
    </BaseDialog>
  );
}

// ─── EDIT MODE (CodeMirror editor) ───────────────────────────────────────────

function EditModeView({
  fileName,
  fileExtension,
  isFullScreen,
  setIsFullScreen,
  cursorPos,
  setCursorPos,
  editor,
  lock,
  versions,
  lockedByOther,
  onClose,
  onSave,
  onToggleLock,
  onExitEditMode,
  onRestore,
  showUnsavedDialog,
  onSaveAndClose,
  onDiscard,
  onCancelUnsaved,
}: {
  fileName: string;
  fileExtension: string;
  isFullScreen: boolean;
  setIsFullScreen: (v: boolean) => void;
  cursorPos: { line: number; col: number };
  setCursorPos: (v: { line: number; col: number }) => void;
  editor: ReturnType<typeof useDocumentEditor>;
  lock: ReturnType<typeof useDocumentLock>;
  versions: ReturnType<typeof useDocumentVersions>;
  lockedByOther: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  onToggleLock: () => Promise<void>;
  onExitEditMode: () => void;
  onRestore: (versionId: string) => Promise<boolean>;
  showUnsavedDialog: boolean;
  onSaveAndClose: () => Promise<void>;
  onDiscard: () => void;
  onCancelUnsaved: () => void;
}) {
  const isReadOnly = lockedByOther;

  return (
    <>
      <BaseDialog
        open={true}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) onClose();
        }}
        closeOnOverlayClick={false}
        containerClassName={`fixed inset-0 z-50 grid place-items-center ${
          isFullScreen ? "p-0" : "p-4 sm:p-6"
        }`}
        overlayClassName="absolute inset-0 bg-black/50 backdrop-blur-sm"
        panelClassName={`relative z-10 flex flex-col overflow-hidden transition-all duration-200 w-full h-full bg-card text-foreground border border-border shadow-2xl ${
          isFullScreen
            ? "rounded-none"
            : "sm:h-auto sm:max-h-[95vh] sm:min-h-[600px] sm:w-[95vw] md:w-[90vw] lg:max-w-6xl sm:rounded-xl"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border/40 shrink-0 gap-4 bg-muted/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex flex-col min-w-0">
              <div
                className="text-sm font-semibold truncate text-foreground"
                title={fileName}
              >
                {fileName}
              </div>
              <div className="flex items-center gap-2">
                <span className="uppercase font-medium tracking-wide text-[10px] bg-muted px-1.5 rounded-sm text-muted-foreground">
                  {fileExtension}
                </span>
                <StatusIndicator
                  isDirty={editor.isDirty}
                  isSaving={editor.isSaving}
                  lockStatus={lock.lockStatus}
                  lockedBy={lock.lockInfo?.LockedByName}
                  hasDraft={editor.metadata?.HasDraft}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Back to view */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={onExitEditMode}
              title="Switch to view mode"
            >
              <Eye size={14} />
              View
            </Button>

            {/* Save */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => void onSave()}
              disabled={!editor.isDirty || editor.isSaving || lockedByOther}
              title="Save (Ctrl+S)"
            >
              {editor.isSaving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
            </Button>

            {/* Lock/Unlock */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => void onToggleLock()}
              disabled={
                lock.isLocking ||
                lock.lockStatus === DocumentLockStatus.LockedByOther
              }
              title={
                lock.lockStatus === DocumentLockStatus.LockedByMe
                  ? "Unlock"
                  : "Lock for editing"
              }
            >
              {lock.isLocking ? (
                <Loader2 size={18} className="animate-spin" />
              ) : lock.lockStatus === DocumentLockStatus.LockedByMe ? (
                <Unlock size={18} />
              ) : (
                <Lock size={18} />
              )}
            </Button>

            <div className="h-6 w-px bg-border/60 mx-1" />

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setIsFullScreen(!isFullScreen)}
              title={isFullScreen ? "Minimize" : "Full Screen"}
            >
              {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </Button>

            {/* Close */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 min-h-0 relative">
          {editor.isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              <Loader2 size={20} className="animate-spin mr-2" />
              Loading document...
            </div>
          ) : editor.isError ? (
            <div className="flex items-center justify-center h-full text-destructive text-sm">
              Failed to load document.
            </div>
          ) : (
            <CodeMirrorEditor
              value={editor.content}
              onChange={editor.setContent}
              extension={fileExtension}
              readOnly={isReadOnly}
              className="h-full"
              onCursorChange={(line, col) => setCursorPos({ line, col })}
            />
          )}
        </div>

        {/* Version History */}
        <VersionHistoryPanel
          versions={versions.versions}
          isLoading={versions.isLoadingVersions}
          diff={versions.diff}
          isLoadingDiff={versions.isLoadingDiff}
          onLoadDiff={versions.loadDiff}
          onClearDiff={versions.clearDiff}
          onRestore={onRestore}
          isRestoring={versions.isRestoring}
          onDelete={versions.deleteVersion}
        />

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-border/40 text-xs text-muted-foreground shrink-0 bg-muted/5">
          <div className="flex items-center gap-3">
            <span>
              Ln {cursorPos.line}, Col {cursorPos.col}
            </span>
            {editor.contentData && (
              <>
                <span>{formatBytes(editor.contentData.SizeInBytes)}</span>
                <span>{editor.contentData.LineCount} lines</span>
                <span>{editor.contentData.CharacterCount} chars</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {editor.metadata?.Language && (
              <span className="uppercase text-[10px] font-medium bg-muted px-1.5 rounded-sm">
                {editor.metadata.Language}
              </span>
            )}
          </div>
        </div>
      </BaseDialog>

      {/* Unsaved changes confirmation */}
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onSaveAndClose={() => void onSaveAndClose()}
        onDiscard={onDiscard}
        onCancel={onCancelUnsaved}
      />
    </>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes?: number) {
  if (!bytes || bytes === 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const sizes = ["B", "KB", "MB", "GB"];
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
}

function humanFileSize(bytes?: number) {
  if (!bytes || bytes === 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
}

function formatOriginalSize(file: CloudObjectModel) {
  const size = humanFileSize(file?.Size);
  const rawWidth = file?.Metadata?.Width;
  const rawHeight = file?.Metadata?.Height;
  const width = rawWidth ? Number(rawWidth) : null;
  const height = rawHeight ? Number(rawHeight) : null;
  const hasDims =
    width && height && Number.isFinite(width) && Number.isFinite(height);
  const dims = hasDims ? `${Math.round(width!)}x${Math.round(height!)}` : null;
  return `Original size: ${size}${dims ? ` \u2022 ${dims}` : ""}`;
}

function formatScaledSize(
  file: CloudObjectModel,
  options?: { isFullScreen?: boolean },
) {
  if (!isImageFile(file)) return null;
  const rawWidth = file?.Metadata?.Width;
  const rawHeight = file?.Metadata?.Height;
  const width = rawWidth ? Number(rawWidth) : null;
  const height = rawHeight ? Number(rawHeight) : null;
  const hasDims =
    width && height && Number.isFinite(width) && Number.isFinite(height);
  if (!hasDims) return null;
  const scaled = getScaledImageDimensions(file, {
    target: options?.isFullScreen ? "fullscreen" : "preview",
  });
  if (!scaled) return null;
  return `Scaled size: ${scaled.width}x${scaled.height}`;
}
