"use client";

import React from "react";
import BaseRenameFolderModal from "@/components/Storage/RenameFolderModal";
import { useExplorerFolderActions } from "../../hooks/useExplorerFolderActions";
import type { CloudDirectoryModel } from "@/Service/Generates/api";

type RenameFolderDialogProps = {
  open: boolean;
  payload: { directory: CloudDirectoryModel } | null;
  onClose: () => void;
};

export default function RenameFolderDialog({
  open,
  payload,
  onClose,
}: RenameFolderDialogProps) {
  const {
    renameTargetFolder,
    renameValue,
    setRenameValue,
    isRenamingFolder,
    renameCurrentName,
    renameIsEncrypted,
    requestRenameFolder,
    closeRenameModal,
    updateFolderNameFromModal,
  } = useExplorerFolderActions();

  React.useEffect(() => {
    if (!open || !payload?.directory) return;
    if (renameTargetFolder?.Prefix === payload.directory.Prefix) return;
    requestRenameFolder(payload.directory);
  }, [open, payload, renameTargetFolder, requestRenameFolder]);

  const handleClose = React.useCallback(() => {
    closeRenameModal();
    onClose();
  }, [closeRenameModal, onClose]);

  return (
    <BaseRenameFolderModal
      open={open && Boolean(renameTargetFolder)}
      onClose={handleClose}
      value={renameValue}
      onChange={setRenameValue}
      onSubmit={async () => {
        await updateFolderNameFromModal();
        onClose();
      }}
      loading={isRenamingFolder}
      currentName={renameCurrentName}
      isEncrypted={renameIsEncrypted}
    />
  );
}
