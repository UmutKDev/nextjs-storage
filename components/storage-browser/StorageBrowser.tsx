import { StorageListView } from "@/components/storage-browser/list/StorageListView";
import { StorageGridView } from "@/components/storage-browser/grid/StorageGridView";
import { useExplorerUI } from "@/features/storage-explorer/contexts/ExplorerUIContext";
import { StorageBrowserInteractionsProvider } from "@/components/storage-browser/contexts/StorageBrowserInteractionsContext";
import type {
  CloudObject,
  Directory,
} from "@/components/storage-browser/types/storage-browser.types";

export interface StorageBrowserProps {
  directories?: Directory[];
  contents?: CloudObject[];
  loading?: boolean;
}

export default function StorageBrowser({
  directories,
  contents,
  loading,
}: StorageBrowserProps) {
  const { viewMode } = useExplorerUI();

  const isLoading = Boolean(loading);
  const isEmptyState = !directories?.length && !contents?.length && !isLoading;

  if (isEmptyState) return null;

  return (
    <StorageBrowserInteractionsProvider isLoading={isLoading}>
      {viewMode === "list" ? (
        <StorageListView directories={directories} files={contents} />
      ) : (
        <StorageGridView directories={directories} files={contents} />
      )}
    </StorageBrowserInteractionsProvider>
  );
}
