import { StorageListFileRow } from "@/components/storage-browser/list/StorageListFileRow";
import { StorageListFolderRow } from "@/components/storage-browser/list/StorageListFolderRow";
import type {
  CloudObject,
  Directory,
} from "@/components/storage-browser/types/storage-browser.types";
import { useStorageBrowserInteractions } from "@/components/storage-browser/contexts/StorageBrowserInteractionsContext";

type StorageListViewProps = {
  directories?: Directory[];
  files?: CloudObject[];
};

export const StorageListView = ({
  directories,
  files,
}: StorageListViewProps) => (
  <StorageListViewContent directories={directories} files={files} />
);

const StorageListViewContent = ({
  directories,
  files,
}: StorageListViewProps) => {
  const { isLoading } = useStorageBrowserInteractions();

  return (
    <div className="divide-y rounded-md border bg-background/50">
      {(directories ?? []).map((directory, index) => {
        const directoryKey = directory.Prefix || `dir-${index}`;

        return (
          <StorageListFolderRow
            key={directoryKey}
            directory={directory}
            directoryKey={directoryKey}
          />
        );
      })}

      {(isLoading ? Array.from({ length: 4 }) : (files ?? [])).map(
        (file, index) => {
          if (isLoading) {
            return (
              <div key={index} className="flex items-center gap-4 px-4 py-3">
                <div className="h-8 w-8 rounded bg-muted/30 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-muted/30 animate-pulse" />
                  <div className="h-3 w-1/4 rounded bg-muted/30 animate-pulse" />
                </div>
              </div>
            );
          }

          const fileItem = file as CloudObject;
          const fileKey = fileItem.Path?.Key ?? `file-${index}`;

          return (
            <StorageListFileRow
              key={fileKey}
              file={fileItem}
              fileKey={fileKey}
            />
          );
        },
      )}
    </div>
  );
};
