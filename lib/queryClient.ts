"use client";

import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

// Creates a configured QueryClient instance for application use
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        // refetchInterval: false,
        // refetchIntervalInBackground: false,
        // refetchOnMount: false,
        // refetchOnReconnect: false,
        // retryOnMount: false,
      },
    },
    mutationCache: new MutationCache({}),
    queryCache: new QueryCache({}),
  });
}

// Client-side singleton for the browser
let defaultClient: QueryClient | null = null;
export function getDefaultQueryClient() {
  if (!defaultClient) defaultClient = createQueryClient();
  return defaultClient;
}
