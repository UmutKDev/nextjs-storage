"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cloudDocumentsApiFactory } from "@/Service/Factories";
import { useWorkspaceStore } from "@/features/teams/stores/workspace.store";
import type {
  DocumentResponseModel,
  DocumentContentResponseModel,
} from "@/types/document.types";
import { DocumentContentLockStatus } from "@/types/document.types";
import { isAxiosError } from "axios";
import { toast } from "sonner";

const DOCUMENT_QUERY_KEY = ["cloud", "documents"] as const;
const DOCUMENT_CONTENT_QUERY_KEY = ["cloud", "documents", "content"] as const;

export function useDocumentEditor(fileKey: string) {
  const queryClient = useQueryClient();
  const activeTeamId = useWorkspaceStore((s) => s.activeTeamId);

  const [content, setContent] = useState("");
  const [originalContentHash, setOriginalContentHash] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Query keys scoped by team
  const metadataQueryKey = useMemo(
    () => [...DOCUMENT_QUERY_KEY, "find", fileKey, activeTeamId],
    [fileKey, activeTeamId],
  );
  const contentQueryKey = useMemo(
    () => [...DOCUMENT_CONTENT_QUERY_KEY, fileKey, activeTeamId],
    [fileKey, activeTeamId],
  );

  // Fetch document metadata
  const metadataQuery = useQuery({
    queryKey: metadataQueryKey,
    queryFn: async ({ signal }) =>
      await cloudDocumentsApiFactory.find({ key: fileKey }, { signal }),
    select: (res) => res.data?.Result as DocumentResponseModel,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    enabled: !!fileKey,
  });

  // Fetch document content (with draft if available)
  const contentQuery = useQuery({
    queryKey: contentQueryKey,
    queryFn: async ({ signal }) =>
      await cloudDocumentsApiFactory.readContent(
        { key: fileKey, includeDraft: true },
        { signal },
      ),
    select: (res) => res.data?.Result as DocumentContentResponseModel,
    staleTime: 0,
    refetchOnWindowFocus: false,
    enabled: !!fileKey,
  });

  // Initialize editor content when data loads
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (contentQuery.data && !hasInitialized.current) {
      hasInitialized.current = true;
      setContent(contentQuery.data.Content ?? "");
      setOriginalContentHash(contentQuery.data.ContentHash ?? "");
      setIsDirty(contentQuery.data.IsDraft ?? false);
    }
  }, [contentQuery.data]);

  // Track dirty state
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setIsDirty(true);
  }, []);

  // Save content
  const save = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const res = await cloudDocumentsApiFactory.updateContent({
        documentUpdateContentRequestModel: {
          Key: fileKey,
          Content: content,
          ExpectedContentHash: originalContentHash || undefined,
        },
      });
      const result = res.data?.Result as DocumentContentResponseModel;
      setOriginalContentHash(result?.ContentHash ?? "");
      setIsDirty(false);
      toast.success("Document saved");

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: metadataQueryKey });
      await queryClient.invalidateQueries({ queryKey: contentQueryKey });
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        return { conflict: true };
      }
      toast.error("Failed to save document");
    } finally {
      setIsSaving(false);
    }
    return { conflict: false };
  }, [
    isSaving,
    fileKey,
    content,
    originalContentHash,
    queryClient,
    metadataQueryKey,
    contentQueryKey,
  ]);

  // Force save (ignore hash check, for conflict resolution)
  const forceSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const res = await cloudDocumentsApiFactory.updateContent({
        documentUpdateContentRequestModel: {
          Key: fileKey,
          Content: content,
        },
      });
      const result = res.data?.Result as DocumentContentResponseModel;
      setOriginalContentHash(result?.ContentHash ?? "");
      setIsDirty(false);
      toast.success("Document saved");
      await queryClient.invalidateQueries({ queryKey: metadataQueryKey });
      await queryClient.invalidateQueries({ queryKey: contentQueryKey });
    } catch {
      toast.error("Failed to save document");
    } finally {
      setIsSaving(false);
    }
  }, [fileKey, content, queryClient, metadataQueryKey, contentQueryKey]);

  // Reload content from server (discard local changes)
  const reload = useCallback(async () => {
    hasInitialized.current = false;
    await queryClient.invalidateQueries({ queryKey: contentQueryKey });
  }, [queryClient, contentQueryKey]);

  const isReadOnly =
    contentQuery.data?.LockStatus === DocumentContentLockStatus.LockedByOther;

  return {
    content,
    setContent: handleContentChange,
    isDirty,
    isSaving,
    save,
    forceSave,
    reload,
    isReadOnly,
    metadata: metadataQuery.data,
    contentData: contentQuery.data,
    isLoading: contentQuery.isLoading,
    isError: contentQuery.isError,
  };
}
