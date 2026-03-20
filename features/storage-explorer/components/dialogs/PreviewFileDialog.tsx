"use client";

import React from "react";
import FilePreviewModal from "@/components/Storage/FilePreviewModal";
import { useExplorerFiltering } from "../../hooks/useExplorerFiltering";
import { useExplorerQuery } from "../../contexts/ExplorerQueryContext";
import { useDialogs } from "../../contexts/DialogsContext";
import { cloudApiFactory } from "@/Service/Factories";
import type { CloudObjectModel } from "@/Service/Generates/api";

type PreviewFileDialogProps = {
  open: boolean;
  payload: { file: CloudObjectModel } | null;
  onClose: () => void;
};

export default function PreviewFileDialog({
  open,
  payload,
  onClose,
}: PreviewFileDialogProps) {
  const { filteredObjectItems } = useExplorerFiltering();
  const { openDialog } = useDialogs();
  const { invalidateObjects } = useExplorerQuery();
  const [fileOverride, setFileOverride] =
    React.useState<CloudObjectModel | null>(null);

  const baseFile = payload?.file ?? null;
  const file = fileOverride ?? baseFile;

  // Reset override when dialog payload changes (e.g. navigating to another file)
  React.useEffect(() => {
    setFileOverride(null);
  }, [baseFile?.Path?.Key]);

  const handleRestored = React.useCallback(async () => {
    await invalidateObjects();
    if (!file?.Path?.Key) return;
    try {
      const resp = await cloudApiFactory.find({ key: file.Path.Key });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = (resp.data as any)?.Result;
      if (updated) {
        setFileOverride(updated as CloudObjectModel);
      }
    } catch {
      // File still shows stale data if re-fetch fails
    }
  }, [invalidateObjects, file?.Path?.Key]);

  return (
    <FilePreviewModal
      file={open ? file : null}
      files={filteredObjectItems}
      onClose={onClose}
      onChange={(nextFile) => {
        openDialog("preview-file", { file: nextFile });
      }}
      onDelete={(target) => {
        openDialog("delete-item", { item: target });
      }}
      onRestored={handleRestored}
    />
  );
}
