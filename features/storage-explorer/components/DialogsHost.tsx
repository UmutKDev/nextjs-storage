"use client";

import React from "react";
import { useDialogs } from "../contexts/DialogsContext";
import CreateFolderDialog from "./dialogs/CreateFolderDialog";
import RenameFolderDialog from "./dialogs/RenameFolderDialog";
import ConvertFolderDialog from "./dialogs/ConvertFolderDialog";
import MoveItemsDialog from "./dialogs/MoveItemsDialog";
import DeleteItemDialog from "./dialogs/DeleteItemDialog";
import DeleteSelectionDialog from "./dialogs/DeleteSelectionDialog";
import ExtractZipDialog from "./dialogs/ExtractZipDialog";
import ExtractZipSelectionDialog from "./dialogs/ExtractZipSelectionDialog";
import ConfirmMoveDragDialog from "./dialogs/ConfirmMoveDragDialog";
import UploadFilesDialog from "./dialogs/UploadFilesDialog";
import EditFileDialog from "./dialogs/EditFileDialog";
import PreviewFileDialog from "./dialogs/PreviewFileDialog";

export default function DialogsHost() {
  const { dialog, closeDialog } = useDialogs();

  return (
    <>
      <CreateFolderDialog
        open={dialog?.type === "create-folder"}
        onClose={closeDialog}
      />
      <RenameFolderDialog
        open={dialog?.type === "rename-folder"}
        payload={dialog?.type === "rename-folder" ? dialog.payload : null}
        onClose={closeDialog}
      />
      <ConvertFolderDialog
        open={dialog?.type === "convert-folder"}
        payload={dialog?.type === "convert-folder" ? dialog.payload : null}
        onClose={closeDialog}
      />
      <MoveItemsDialog
        open={dialog?.type === "move-items"}
        payload={dialog?.type === "move-items" ? dialog.payload : null}
        onClose={closeDialog}
      />
      <DeleteItemDialog
        open={dialog?.type === "delete-item"}
        payload={dialog?.type === "delete-item" ? dialog.payload : null}
        onClose={closeDialog}
      />
      <DeleteSelectionDialog
        open={dialog?.type === "delete-selection"}
        payload={dialog?.type === "delete-selection" ? dialog.payload : null}
        onClose={closeDialog}
      />
      <ExtractZipDialog
        open={dialog?.type === "extract-zip"}
        payload={dialog?.type === "extract-zip" ? dialog.payload : null}
        onClose={closeDialog}
      />
      <ExtractZipSelectionDialog
        open={dialog?.type === "extract-zip-selection"}
        payload={dialog?.type === "extract-zip-selection" ? dialog.payload : null}
        onClose={closeDialog}
      />
      <ConfirmMoveDragDialog
        open={dialog?.type === "confirm-move-drag"}
        payload={dialog?.type === "confirm-move-drag" ? dialog.payload : null}
        onClose={closeDialog}
      />
      <UploadFilesDialog
        open={dialog?.type === "upload-files"}
        onClose={closeDialog}
      />
      <EditFileDialog
        open={dialog?.type === "edit-file"}
        payload={dialog?.type === "edit-file" ? dialog.payload : null}
        onClose={closeDialog}
      />
      <PreviewFileDialog
        open={dialog?.type === "preview-file"}
        payload={dialog?.type === "preview-file" ? dialog.payload : null}
        onClose={closeDialog}
      />
    </>
  );
}
