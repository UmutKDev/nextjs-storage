"use client";

import React from "react";
import { DragOverlay, Modifier } from "@dnd-kit/core";
import { Folder } from "lucide-react";
import FileIcon from "@/components/Storage/FileIcon";
import { useExplorerDnD } from "../../contexts/ExplorerDnDContext";
import { useExplorerFiltering } from "../../hooks/useExplorerFiltering";

const snapToCursor: Modifier = ({
  transform,
  activatorEvent,
  draggingNodeRect,
}) => {
  if (draggingNodeRect && activatorEvent) {
    const activator = activatorEvent as unknown as MouseEvent;
    if ("clientX" in activator) {
      const offsetX = activator.clientX - draggingNodeRect.left;
      const offsetY = activator.clientY - draggingNodeRect.top;

      return {
        ...transform,
        x: transform.x + offsetX - draggingNodeRect.width / 2,
        y: transform.y + offsetY - draggingNodeRect.height / 2,
      };
    }
  }

  return transform;
};

export default function DragPreviewOverlay() {
  const { activeDraggedItemKey } = useExplorerDnD();
  const { objectItems, directoryItems } = useExplorerFiltering();

  const activeItem = React.useMemo(() => {
    if (!activeDraggedItemKey) return null;
    const directory = directoryItems.find(
      (entry) => entry.Prefix === activeDraggedItemKey
    );
    if (directory) return { type: "folder" as const, data: directory };
    const file = objectItems.find(
      (entry) => entry.Path?.Key === activeDraggedItemKey
    );
    if (file) return { type: "file" as const, data: file };
    return null;
  }, [activeDraggedItemKey, directoryItems, objectItems]);

  return (
    <DragOverlay dropAnimation={null} modifiers={[snapToCursor]}>
      {activeItem ? (
        <div className="opacity-90 pointer-events-none w-64 cursor-grabbing">
          <div className="px-4 py-3 bg-card border rounded-md shadow-xl flex items-center gap-3">
            {activeItem.type === "folder" ? (
              <div className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
                <Folder size={18} fill="currentColor" className="opacity-80" />
              </div>
            ) : (
              <div className="w-8 h-8 flex items-center justify-center rounded-md bg-muted/20">
                <FileIcon extension={activeItem.data.Extension} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {activeItem.type === "folder"
                  ? activeItem.data.Name
                  : activeItem.data.Metadata?.Originalfilename ||
                    activeItem.data.Name}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </DragOverlay>
  );
}
