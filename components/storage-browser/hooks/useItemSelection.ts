import React from "react";

type UseItemSelectionArgs = {
  selectedItemKeys: Set<string>;
  orderedItemKeys?: string[];
  onSelectionChange?: (nextSelection: Set<string>) => void;
};

export const useItemSelection = ({
  selectedItemKeys,
  orderedItemKeys,
  onSelectionChange,
}: UseItemSelectionArgs) => {
  const lastSelectedKeyRef = React.useRef<string | null>(null);

  const updateSelection = React.useCallback(
    (
      itemKey: string,
      options?: { allowMultiple?: boolean; rangeSelect?: boolean },
    ) => {
      if (!onSelectionChange) return;
      const allowMultiple = options?.allowMultiple ?? false;
      const rangeSelect = options?.rangeSelect ?? false;

      if (rangeSelect && orderedItemKeys?.length) {
        const anchorKey = lastSelectedKeyRef.current;
        const anchorIndex = anchorKey
          ? orderedItemKeys.indexOf(anchorKey)
          : -1;
        const targetIndex = orderedItemKeys.indexOf(itemKey);

        if (anchorIndex !== -1 && targetIndex !== -1) {
          const nextSelection = new Set(
            allowMultiple ? selectedItemKeys : [],
          );
          const [start, end] =
            anchorIndex < targetIndex
              ? [anchorIndex, targetIndex]
              : [targetIndex, anchorIndex];

          orderedItemKeys.slice(start, end + 1).forEach((key) => {
            nextSelection.add(key);
          });
          onSelectionChange(nextSelection);
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
      onSelectionChange(nextSelection);
      lastSelectedKeyRef.current = itemKey;
    },
    [onSelectionChange, orderedItemKeys, selectedItemKeys],
  );

  const replaceSelection = React.useCallback(
    (nextSelection: Set<string>) => {
      if (!onSelectionChange) return;
      onSelectionChange(new Set(nextSelection));
    },
    [onSelectionChange],
  );

  const isItemSelected = React.useCallback(
    (itemKey: string) => selectedItemKeys.has(itemKey),
    [selectedItemKeys],
  );

  return { updateSelection, replaceSelection, isItemSelected };
};
