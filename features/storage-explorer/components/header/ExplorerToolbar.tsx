"use client";

import React from "react";
import { Archive, FolderInput, LayoutGrid, List, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/Storage/SearchBar";
import { useExplorerUI } from "../../contexts/ExplorerUIContext";
import { useExplorerSelection } from "../../contexts/ExplorerSelectionContext";
import { useExplorerFiltering } from "../../hooks/useExplorerFiltering";
import { useExplorerActions } from "../../contexts/ExplorerActionsContext";
import { useDialogs } from "../../contexts/DialogsContext";

export default function ExplorerToolbar() {
  const { viewMode, setViewMode, searchQuery, setSearchQuery } =
    useExplorerUI();
  const { selectedItemKeys, selectAllVisibleItems } = useExplorerSelection();
  const { filteredDirectoryItems, filteredObjectItems } =
    useExplorerFiltering();
  const { extractZipSelection } = useExplorerActions();
  const { openDialog } = useDialogs();

  const selectAllVisibleItemsInView = React.useCallback(() => {
    const allKeys: string[] = [];
    filteredDirectoryItems.forEach((directory) => {
      if (directory.Prefix) allKeys.push(directory.Prefix);
    });
    filteredObjectItems.forEach((file) => {
      if (file.Path?.Key) allKeys.push(file.Path.Key);
    });
    selectAllVisibleItems(allKeys);
  }, [filteredDirectoryItems, filteredObjectItems, selectAllVisibleItems]);

  const selectedZipFiles = React.useMemo(() => {
    if (selectedItemKeys.size === 0) return [];
    return filteredObjectItems.filter((file) => {
      const key = file.Path?.Key;
      if (!key || !selectedItemKeys.has(key)) return false;
      const ext = (file.Extension || "").toLowerCase();
      if (ext === "zip") return true;
      const name = (
        file.Metadata?.Originalfilename ||
        file.Name ||
        ""
      ).toLowerCase();
      return name.endsWith(".zip");
    });
  }, [selectedItemKeys, filteredObjectItems]);

  return (
    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
      {selectedItemKeys.size > 0 ? (
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={selectAllVisibleItemsInView}
            className="shrink-0 whitespace-nowrap"
          >
            <span className="md:hidden">Tümü</span>
            <span className="hidden md:inline">Tümünü Seç</span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              openDialog("move-items", { items: Array.from(selectedItemKeys) })
            }
            className="shrink-0 whitespace-nowrap"
          >
            <FolderInput size={16} className="mr-2" />
            <span className="hidden sm:inline">
              Taşı ({selectedItemKeys.size})
            </span>
            <span className="sm:hidden">Taşı</span>
          </Button>
          {selectedZipFiles.length > 0 ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => extractZipSelection(selectedZipFiles)}
              className="shrink-0 whitespace-nowrap"
            >
              <Archive size={16} className="mr-2" />
              <span className="hidden sm:inline">
                Zip Çıkar ({selectedZipFiles.length})
              </span>
              <span className="sm:hidden">Zip Çıkar</span>
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="destructive"
            onClick={() =>
              openDialog("delete-selection", {
                count: selectedItemKeys.size,
              })
            }
            className="shrink-0 whitespace-nowrap"
          >
            <Trash2 size={16} className="mr-2" />
            <span className="hidden sm:inline">
              Sil ({selectedItemKeys.size})
            </span>
            <span className="sm:hidden">Sil</span>
          </Button>
        </div>
      ) : (
        <div className="w-full md:w-auto">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      )}

      <div className="hidden sm:flex items-center gap-1 border-l pl-2 ml-2">
        <Button
          variant={viewMode === "list" ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setViewMode("list")}
        >
          <List size={16} />
        </Button>
        <Button
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setViewMode("grid")}
        >
          <LayoutGrid size={16} />
        </Button>
      </div>
    </div>
  );
}
