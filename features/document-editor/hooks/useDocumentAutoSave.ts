"use client";

import { useEffect, useRef } from "react";
import { cloudDocumentsApiFactory } from "@/Service/Factories";
import { isAxiosError } from "axios";

const DEBOUNCE_MS = 2_000;

export function useDocumentAutoSave(
  fileKey: string,
  content: string,
  isDirty: boolean,
  enabled: boolean,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef(content);
  const isSavingRef = useRef(false);
  contentRef.current = content;

  useEffect(() => {
    if (!enabled || !isDirty) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;

      try {
        await cloudDocumentsApiFactory.saveDraft({
          documentDraftRequestModel: {
            Key: fileKey,
            Content: contentRef.current,
          },
        });
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 429) {
          // Throttled — silently retry later
          const retryAfter = error.response.data?.Result?.NextAllowedSaveAt;
          if (retryAfter) {
            const delayMs = Math.max(
              0,
              new Date(retryAfter).getTime() - Date.now(),
            );
            setTimeout(async () => {
              try {
                await cloudDocumentsApiFactory.saveDraft({
                  documentDraftRequestModel: {
                    Key: fileKey,
                    Content: contentRef.current,
                  },
                });
              } catch {
                // Silently fail
              }
            }, delayMs);
          }
        }
      } finally {
        isSavingRef.current = false;
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fileKey, content, isDirty, enabled]);
}
