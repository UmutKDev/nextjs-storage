"use client";

import React from "react";
import BaseConvertToEncryptedModal from "@/components/Storage/ConvertToEncryptedModal";
import { useExplorerFolderActions } from "../../hooks/useExplorerFolderActions";
import type { CloudDirectoryModel } from "@/Service/Generates/api";

type ConvertFolderDialogProps = {
  open: boolean;
  payload: { directory: CloudDirectoryModel } | null;
  onClose: () => void;
};

export default function ConvertFolderDialog({
  open,
  payload,
  onClose,
}: ConvertFolderDialogProps) {
  const {
    convertTargetFolder,
    convertPassphrase,
    setConvertPassphrase,
    isConvertingFolder,
    requestConvertFolder,
    closeConvertModal,
    convertFolderToEncrypted,
  } = useExplorerFolderActions();

  React.useEffect(() => {
    if (!open || !payload?.directory) return;
    if (convertTargetFolder?.Prefix === payload.directory.Prefix) return;
    requestConvertFolder(payload.directory);
  }, [open, payload, convertTargetFolder, requestConvertFolder]);

  const handleClose = React.useCallback(() => {
    closeConvertModal();
    onClose();
  }, [closeConvertModal, onClose]);

  return (
    <BaseConvertToEncryptedModal
      open={open && Boolean(convertTargetFolder)}
      folderName={convertTargetFolder?.Name}
      passphrase={convertPassphrase}
      onPassphraseChange={setConvertPassphrase}
      onSubmit={async () => {
        await convertFolderToEncrypted();
        onClose();
      }}
      onClose={handleClose}
      loading={isConvertingFolder}
    />
  );
}
