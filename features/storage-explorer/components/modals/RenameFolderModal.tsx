"use client";

import React from "react";
import BaseRenameFolderModal from "@/components/Storage/RenameFolderModal";
import { useExplorerFolderActions } from "../../hooks/useExplorerFolderActions";

export default function RenameFolderModal() {
  const {
    renameTargetFolder,
    renameValue,
    setRenameValue,
    isRenamingFolder,
    renameCurrentName,
    renameIsEncrypted,
    closeRenameModal,
    updateFolderNameFromModal,
  } = useExplorerFolderActions();

  return (
    <BaseRenameFolderModal
      open={Boolean(renameTargetFolder)}
      onClose={closeRenameModal}
      value={renameValue}
      onChange={setRenameValue}
      onSubmit={() => void updateFolderNameFromModal()}
      loading={isRenamingFolder}
      currentName={renameCurrentName}
      isEncrypted={renameIsEncrypted}
    />
  );
}
