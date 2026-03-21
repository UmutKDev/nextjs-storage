"use client";

import React from "react";
import { CreateDocumentDialog } from "@/features/document-editor";
import { useStorage } from "@/components/Storage/StorageProvider";
import { useDialogs } from "../../contexts/DialogsContext";
import { useExplorerQuery } from "../../contexts/ExplorerQueryContext";
import type { DocumentResponseModel } from "@/types/document.types";
import type { CloudObjectModel } from "@/Service/Generates/api";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CreateDocumentDialogWrapper({ open, onClose }: Props) {
  const { currentPath } = useStorage();
  const { openDialog } = useDialogs();
  const { invalidateObjects } = useExplorerQuery();

  const handleCreated = React.useCallback(
    async (doc: DocumentResponseModel) => {
      await invalidateObjects();
      // Open the newly created document in the editor
      openDialog("document-editor", {
        file: {
          Path: { Key: doc.Key },
          Name: doc.Name,
          Extension: doc.Extension,
        } as CloudObjectModel,
      });
    },
    [invalidateObjects, openDialog],
  );

  return (
    <CreateDocumentDialog
      open={open}
      currentPath={currentPath}
      onClose={onClose}
      onCreated={handleCreated}
    />
  );
}
