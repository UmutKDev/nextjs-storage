"use client";

import React from "react";
import type {
  CloudObjectModel,
  CloudDirectoryModel,
} from "@/Service/Generates/api";

type DialogPayloads = {
  "create-folder": Record<string, never>;
  "rename-folder": { directory: CloudDirectoryModel };
  "convert-folder": { directory: CloudDirectoryModel };
  "move-items": { items: string[] };
  "delete-item": { item: CloudObjectModel | CloudDirectoryModel };
  "delete-selection": { count: number };
  "archive-preview-extract": { file: CloudObjectModel };
  "archive-extract-selection": { files: CloudObjectModel[] };
  "archive-create": { keys: string[] };
  "confirm-move-drag": {
    sourceKeys: string[];
    targetKey: string;
    sourceName?: string;
    targetName?: string;
  };
  "upload-files": Record<string, never>;
  "edit-file": { file: CloudObjectModel };
  "preview-file": { file: CloudObjectModel };
};

export type DialogType = keyof DialogPayloads;

type DialogState =
  | {
      [Type in DialogType]: {
        type: Type;
        payload: DialogPayloads[Type];
      };
    }[DialogType]
  | null;

type DialogsContextValue = {
  dialog: DialogState;
  openDialog: <T extends DialogType>(
    type: T,
    payload: DialogPayloads[T],
  ) => void;
  closeDialog: () => void;
};

const DialogsContext = React.createContext<DialogsContextValue | null>(null);

export function DialogsProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = React.useState<DialogState>(null);

  const openDialog = React.useCallback(
    <T extends DialogType>(type: T, payload: DialogPayloads[T]) => {
      setDialog({ type, payload } as DialogState);
    },
    [],
  );

  const closeDialog = React.useCallback(() => {
    setDialog(null);
  }, []);

  return (
    <DialogsContext.Provider value={{ dialog, openDialog, closeDialog }}>
      {children}
    </DialogsContext.Provider>
  );
}

export function useDialogs() {
  const context = React.useContext(DialogsContext);
  if (!context) {
    throw new Error("useDialogs must be used within DialogsProvider");
  }
  return context;
}
