"use client";

import React from "react";
import BaseCreateFolderModal from "@/components/Storage/CreateFolderModal";
import { useExplorerUI } from "../../contexts/ExplorerUIContext";
import { useExplorerFolderActions } from "../../hooks/useExplorerFolderActions";

export default function CreateFolderModal() {
  const { isCreateFolderModalOpen, setIsCreateFolderModalOpen } =
    useExplorerUI();
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

  return (
    <BaseCreateFolderModal
      open={isCreateFolderModalOpen}
      onClose={() => {
        setIsCreateFolderModalOpen(false);
        setIsNewFolderEncrypted(false);
        setNewFolderPassphrase("");
      }}
      onSubmit={createFolder}
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
