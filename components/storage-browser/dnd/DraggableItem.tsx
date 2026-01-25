import React from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import type {
  StorageItemType,
} from "@/components/storage-browser/types/storage-browser.types";

type DraggableItemProps = {
  itemKey: string;
  itemType: StorageItemType;
  isSelected?: boolean;
  className?: string;
  children: React.ReactNode;
  data?: Record<string, unknown>;
};

export const DraggableItem = ({
  itemKey,
  itemType,
  isSelected,
  className,
  children,
  data,
}: DraggableItemProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: itemKey,
    data: { type: itemType, id: itemKey, ...(data ?? {}) },
  });

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: itemKey,
    data: { type: itemType, id: itemKey, ...(data ?? {}) },
    disabled: itemType === "file",
  });

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        setDroppableRef(node);
      }}
      {...listeners}
      {...attributes}
      className={cn(
        "relative transition-colors outline-none",
        isDragging && "opacity-30",
        isOver &&
          itemType === "folder" &&
          "bg-primary/10 ring-2 ring-primary ring-inset rounded-md",
        isSelected && "bg-muted/20 ring-1 ring-border",
        className,
      )}
    >
      {children}
    </div>
  );
};
