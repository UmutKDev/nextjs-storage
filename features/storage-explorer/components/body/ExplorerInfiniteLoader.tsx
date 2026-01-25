"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExplorerInfiniteLoader({
  loadedItemCount,
  totalItemCount,
  canLoadMore,
  isFetchingMore,
  onLoadMore,
}: {
  loadedItemCount: number;
  totalItemCount: number;
  canLoadMore: boolean;
  isFetchingMore: boolean;
  onLoadMore: () => void;
}) {
  return (
    <div className="p-4 border-t bg-card/50 backdrop-blur-sm flex items-center justify-between shrink-0">
      <div className="text-sm text-muted-foreground">
        {loadedItemCount > 0
          ? `Yüklenen: ${loadedItemCount}${
              totalItemCount ? ` / ${totalItemCount}` : ""
            }`
          : "Henüz içerik yok"}
      </div>
      <div className="flex items-center gap-2">
        {isFetchingMore && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onLoadMore}
          disabled={!canLoadMore || isFetchingMore}
        >
          {canLoadMore ? "Daha Fazla Yükle" : "Tümü yüklendi"}
        </Button>
      </div>
    </div>
  );
}
