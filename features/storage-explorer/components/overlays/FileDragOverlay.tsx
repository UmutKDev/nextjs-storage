"use client";

import React from "react";
import { UploadCloud } from "lucide-react";

export default function FileDragOverlay({
  isVisible,
}: {
  isVisible: boolean;
}) {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-background/75 via-background/60 to-background/80 backdrop-blur-md" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="relative mx-6 w-full max-w-[520px]">
          <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-r from-foreground/12 via-transparent to-foreground/12 blur-2xl" />
          <div className="relative overflow-hidden rounded-[28px] border border-foreground/10 bg-card/80 shadow-2xl backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-foreground/5 to-transparent" />
            <div className="relative px-8 py-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-foreground/10 bg-background/70 shadow-sm">
                <UploadCloud className="h-6 w-6 text-foreground" />
              </div>
              <div className="mt-5 text-base font-semibold tracking-wide text-foreground">
                Dosyaları buraya bırakın
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Yükleme otomatik olarak başlar
              </div>
              <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground/80">
                Hazır
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
