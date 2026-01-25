"use client";

import React from "react";
import BaseCreateFolderModal from "@/components/Storage/CreateFolderModal";
import { useExplorerFolderActions } from "../../hooks/useExplorerFolderActions";

type CreateFolderDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function CreateFolderDialog({
  open,
  onClose,
}: CreateFolderDialogProps) {
  const {
    folderNameInput,
    setFolderNameInput,
    isNewFolderEncrypted,
    setIsNewFolderEncrypted,
    newFolderPassphrase,
    setNewFolderPassphrase,
    isCreatingFolder,
    createFolder,
  } = useExplorerFolderActions();

  const handleClose = React.useCallback(() => {
    setIsNewFolderEncrypted(false);
    setNewFolderPassphrase("");
    onClose();
  }, [onClose, setIsNewFolderEncrypted, setNewFolderPassphrase]);

  return (
    <BaseCreateFolderModal
      open={open}
      onClose={handleClose}
      onSubmit={async () => {
        await createFolder();
        onClose();
      }}
      loading={isCreatingFolder}
      value={folderNameInput}
      onChange={setFolderNameInput}
      isEncrypted={isNewFolderEncrypted}
      onIsEncryptedChange={setIsNewFolderEncrypted}
      passphrase={newFolderPassphrase}
      onPassphraseChange={setNewFolderPassphrase}
    />
  );
}
