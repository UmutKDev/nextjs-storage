"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cloudDocumentsApiFactory } from "@/Service/Factories";
import { useWorkspaceStore } from "@/features/teams/stores/workspace.store";
import { toast } from "sonner";
import type { DocumentDiffResponseModel } from "@/types/document.types";

const DOCUMENT_VERSIONS_QUERY_KEY = ["cloud", "documents", "versions"] as const;

export function useDocumentVersions(fileKey: string) {
  const queryClient = useQueryClient();
  const activeTeamId = useWorkspaceStore((s) => s.activeTeamId);
  const [diff, setDiff] = useState<DocumentDiffResponseModel | null>(null);
  const [isLoadingDiff, setIsLoadingDiff] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const versionsQueryKey = useMemo(
    () => [...DOCUMENT_VERSIONS_QUERY_KEY, fileKey, activeTeamId],
    [fileKey, activeTeamId],
  );

  const versionsQuery = useQuery({
    queryKey: versionsQueryKey,
    queryFn: async ({ signal }) =>
      await cloudDocumentsApiFactory.listVersions({ key: fileKey }, { signal }),
    select: (res) => {
      // listVersions returns void in the generated type but actually returns version array
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = res.data as any;
      return data?.Result ?? [];
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    enabled: !!fileKey,
  });

  const loadDiff = useCallback(
    async (sourceVersionId: string, targetVersionId: string) => {
      setIsLoadingDiff(true);
      try {
        const res = await cloudDocumentsApiFactory.diffVersions({
          key: fileKey,
          sourceVersionId,
          targetVersionId,
        });
        setDiff(
          (res.data as { Result?: DocumentDiffResponseModel })?.Result ?? null,
        );
      } catch {
        toast.error("Failed to load diff");
      } finally {
        setIsLoadingDiff(false);
      }
    },
    [fileKey],
  );

  const clearDiff = useCallback(() => setDiff(null), []);

  const restoreVersion = useCallback(
    async (versionId: string) => {
      setIsRestoring(true);
      try {
        await cloudDocumentsApiFactory.restoreVersion({
          documentRestoreVersionRequestModel: {
            Key: fileKey,
            VersionId: versionId,
          },
        });
        toast.success("Version restored");
        await queryClient.invalidateQueries({ queryKey: versionsQueryKey });
        return true;
      } catch {
        toast.error("Failed to restore version");
        return false;
      } finally {
        setIsRestoring(false);
      }
    },
    [fileKey, queryClient, versionsQueryKey],
  );

  const deleteVersion = useCallback(
    async (versionId: string) => {
      try {
        await cloudDocumentsApiFactory.deleteVersion({
          documentDeleteVersionRequestModel: {
            Key: fileKey,
            VersionId: versionId,
          },
        });
        toast.success("Version deleted");
        await queryClient.invalidateQueries({ queryKey: versionsQueryKey });
      } catch {
        toast.error("Failed to delete version");
      }
    },
    [fileKey, queryClient, versionsQueryKey],
  );

  return {
    versions: versionsQuery.data ?? [],
    isLoadingVersions: versionsQuery.isLoading,
    diff,
    isLoadingDiff,
    loadDiff,
    clearDiff,
    restoreVersion,
    isRestoring,
    deleteVersion,
  };
}
