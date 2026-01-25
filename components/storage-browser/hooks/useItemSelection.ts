import React from "react";
import { useExplorerSelection } from "@/features/storage-explorer/contexts/ExplorerSelectionContext";
import { useExplorerSelectionRange } from "@/features/storage-explorer/contexts/ExplorerSelectionRangeContext";

export const useItemSelection = () => {
  const { selectedItemKeys, replaceSelectedItemKeys } = useExplorerSelection();
  const { orderedKeys, replaceSelectionRange } = useExplorerSelectionRange();
  const lastSelectedKeyRef = React.useRef<string | null>(null);

  const updateSelection = React.useCallback(
    (
      itemKey: string,
      options?: { allowMultiple?: boolean; rangeSelect?: boolean },
    ) => {
      const allowMultiple = options?.allowMultiple ?? false;
      const rangeSelect = options?.rangeSelect ?? false;

      if (rangeSelect && orderedKeys.length) {
        const anchorKey = lastSelectedKeyRef.current;
        if (anchorKey) {
          const baseSelection = allowMultiple ? selectedItemKeys : undefined;
          replaceSelectionRange(anchorKey, itemKey, { baseSelection });
          lastSelectedKeyRef.current = itemKey;
          return;
        }
      }

      const nextSelection = new Set(allowMultiple ? selectedItemKeys : []);
      if (nextSelection.has(itemKey)) {
        nextSelection.delete(itemKey);
      } else {
        nextSelection.add(itemKey);
      }
      replaceSelectedItemKeys(nextSelection);
      lastSelectedKeyRef.current = itemKey;
    },
    [orderedKeys, replaceSelectedItemKeys, replaceSelectionRange, selectedItemKeys],
  );

  const replaceSelection = React.useCallback(
    (nextSelection: Set<string>) => {
      replaceSelectedItemKeys(new Set(nextSelection));
    },
    [replaceSelectedItemKeys],
  );

  const isItemSelected = React.useCallback(
    (itemKey: string) => selectedItemKeys.has(itemKey),
    [selectedItemKeys],
  );

  return { updateSelection, replaceSelection, isItemSelected };
};
