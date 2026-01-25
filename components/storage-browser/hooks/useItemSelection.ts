import React from "react";

type UseItemSelectionArgs = {
  selectedItemKeys: Set<string>;
  onSelectionChange?: (nextSelection: Set<string>) => void;
};

export const useItemSelection = ({
  selectedItemKeys,
  onSelectionChange,
}: UseItemSelectionArgs) => {
  const updateSelection = React.useCallback(
    (itemKey: string, allowMultiple: boolean) => {
      if (!onSelectionChange) return;
      const nextSelection = new Set(allowMultiple ? selectedItemKeys : []);
      if (nextSelection.has(itemKey)) {
        nextSelection.delete(itemKey);
      } else {
        nextSelection.add(itemKey);
      }
      onSelectionChange(nextSelection);
    },
    [onSelectionChange, selectedItemKeys],
  );

  const isItemSelected = React.useCallback(
    (itemKey: string) => selectedItemKeys.has(itemKey),
    [selectedItemKeys],
  );

  return { updateSelection, isItemSelected };
};
