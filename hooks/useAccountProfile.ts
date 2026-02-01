"use client";

import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { accountApiFactory } from "@/Service/Factories";

export const ACCOUNT_PROFILE_QUERY_KEY = ["account", "profile"] as const;

export const createAccountProfileQueryKey = () =>
  [...ACCOUNT_PROFILE_QUERY_KEY] as const;

export default function useAccountProfile() {
  const { status } = useSession();
  const queryClient = useQueryClient();

  const accountProfileQueryKey = useMemo(
    () => createAccountProfileQueryKey(),
    [],
  );

  const accountProfileQuery = useQuery({
    queryKey: accountProfileQueryKey,
    queryFn: async ({ signal }) => {
      const res = await accountApiFactory.profile({ signal });
      return res.data?.Result;
    },
    enabled: status === "authenticated",
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
  });

  const invalidate = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: ACCOUNT_PROFILE_QUERY_KEY,
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === ACCOUNT_PROFILE_QUERY_KEY[0] &&
          query.queryKey[1] === ACCOUNT_PROFILE_QUERY_KEY[1],
      }),
    [queryClient],
  );

  return {
    accountProfileQueryKey,
    accountProfileQuery,
    invalidate,
  };
}
