"use client";

import React from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Sidebar from "@/components/Storage/Sidebar";
import ExplorerHeader from "./header/ExplorerHeader";
import ExplorerBody from "./body/ExplorerBody";
import DragPreviewOverlay from "./overlays/DragPreviewOverlay";
import CreateFolderModal from "./modals/CreateFolderModal";
import ConvertEncryptedModal from "./modals/ConvertEncryptedModal";
import RenameFolderModal from "./modals/RenameFolderModal";
import MoveItemsModal from "./modals/MoveItemsModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import ExtractZipModal from "./modals/ExtractZipModal";
import FileUploadModal from "./modals/FileUploadModal";
import DragMoveConfirmModal from "./modals/ConfirmMoveDragModal";
import FilePreviewModal from "./modals/FilePreviewModal";
import { useExplorerDnD } from "../contexts/ExplorerDnDContext";
import { useExplorerUI } from "../contexts/ExplorerUIContext";
import { useExplorerNavigation } from "../hooks/useExplorerNavigation";

export default function ExplorerLayout() {
  const { startDragTracking, finalizeDragTracking } = useExplorerDnD();
  const { isMobileSidebarOpen, setIsMobileSidebarOpen } = useExplorerUI();

  useExplorerNavigation();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 15,
      },
    }),
    useSensor(KeyboardSensor)
  );

  return (
    <div className="h-screen overflow-hidden flex bg-background">
      <Sidebar className="hidden md:flex flex-none w-64 pt-24" />

      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden animate-in fade-in"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-3/4 max-w-[300px] bg-background border-r shadow-lg animate-in slide-in-from-left pt-20"
            onClick={(event) => event.stopPropagation()}
          >
            <Sidebar className="w-full h-full border-none bg-transparent" />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden pt-20 md:pt-24 px-2 md:px-4 pb-4">
        <div className="w-full h-full flex flex-col">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl md:rounded-2xl shadow-sm h-full overflow-hidden flex flex-col">
            <DndContext
              sensors={sensors}
              collisionDetection={pointerWithin}
              onDragStart={startDragTracking}
              onDragEnd={finalizeDragTracking}
            >
              <div className="flex flex-col h-full">
                <ExplorerHeader />
                <ExplorerBody />
                <DragPreviewOverlay />
              </div>
            </DndContext>
          </div>
        </div>
      </div>

      <MoveItemsModal />
      <CreateFolderModal />
      <ConvertEncryptedModal />
      <RenameFolderModal />
      <FileUploadModal />
      <DragMoveConfirmModal />
      <DeleteConfirmModal />
      <ExtractZipModal />
      <FilePreviewModal />
    </div>
  );
}
