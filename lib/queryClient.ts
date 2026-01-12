"use client";

import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

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
    mutationCache: new MutationCache({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) =>
        toast.error(error?.message || "Bir hata oluştu."),
      onMutate: (_, mutation) => {
        if (!mutation.meta?.IGNORE_BASE_TOASTER)
          toast.promise(
            mutation.continue(),
            {
              loading: "Yükleniyor",
              error: null,
              success: "İşlem Başarılı",
            },
            {
              error: {
                style: {
                  display: "none",
                },
              },
            }
          );
      },
    }),
    queryCache: new QueryCache({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any, query) => {
        // Suppress 403 errors for objects and directories queries
        if (error?.response?.status === 403) {
          const queryKey = query.queryKey as string[];
          if (
            (queryKey.includes("cloud") && queryKey.includes("objects")) ||
            (queryKey.includes("cloud") && queryKey.includes("directories"))
          ) {
            return;
          }
        }
        toast.error(error?.message || "Bir hata oluştu.");
      },
    }),
  });
}

// Client-side singleton for the browser
let defaultClient: QueryClient | null = null;
export function getDefaultQueryClient() {
  if (!defaultClient) defaultClient = createQueryClient();
  return defaultClient;
}
