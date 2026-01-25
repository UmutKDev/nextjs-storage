"use client";

import React from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExplorerEncryption } from "../../contexts/ExplorerEncryptionContext";
import { useExplorerQuery } from "../../contexts/ExplorerQueryContext";
import { getFolderNameFromPrefix } from "../../utils/path";

export default function ExplorerLockedState() {
  const { lockedFolderPath, requestFolderUnlock } = useExplorerEncryption();
  const { currentPath } = useExplorerQuery();
  const folderLabel =
    currentPath.split("/").filter(Boolean).pop() || "bu klasör";

  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-5 px-4 py-10">
      <div className="w-14 h-14 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground">
        <Lock className="w-6 h-6" />
      </div>
      <div className="space-y-2 max-w-md">
        <div className="text-lg font-semibold text-foreground">
          Şifrelenmiş klasör kilitli
        </div>
        <p className="text-sm text-muted-foreground">
          {folderLabel} şifrelenmiş durumda. İçeriği görüntülemek için parolayı
          girerek bu klasörü kilitsiz hale getirin.
        </p>
      </div>
      <Button
        onClick={() =>
          requestFolderUnlock({
            path: lockedFolderPath,
            label: getFolderNameFromPrefix(lockedFolderPath) || folderLabel,
            force: true,
          })
        }
        size="sm"
      >
        Klasörü Kilitsiz Yap
      </Button>
    </div>
  );
}
