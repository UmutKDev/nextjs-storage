"use client";

import React from "react";
import ConvertToEncryptedModal from "@/components/Storage/ConvertToEncryptedModal";
import { useExplorerFolderActions } from "../../hooks/useExplorerFolderActions";
import { getFolderNameFromPrefix } from "../../utils/path";

export default function ConvertEncryptedModal() {
  const {
    convertTargetFolder,
    convertPassphrase,
    setConvertPassphrase,
    isConvertingFolder,
    closeConvertModal,
    convertFolderToEncrypted,
  } = useExplorerFolderActions();

  return (
    <ConvertToEncryptedModal
      open={Boolean(convertTargetFolder)}
      onClose={closeConvertModal}
      folderName={
        convertTargetFolder
          ? getFolderNameFromPrefix(convertTargetFolder.Prefix)
          : ""
      }
      passphrase={convertPassphrase}
      onPassphraseChange={setConvertPassphrase}
      onSubmit={() => void convertFolderToEncrypted()}
      loading={isConvertingFolder}
    />
  );
}
