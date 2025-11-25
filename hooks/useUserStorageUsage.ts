"use client";

import { useQuery } from "@tanstack/react-query";
import { userStorageUsage as fetchUsage } from "@/Service/Factories";
import type { CloudUserStorageUsageResponseModel } from "@/Service/Generates/api";

export default function useUserStorageUsage() {
  return useQuery<CloudUserStorageUsageResponseModel | undefined>({
    queryKey: ["cloud", "user-storage-usage"],
    queryFn: async () => {
      // our wrapper returns result directly
      const r = await fetchUsage();
      return r;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
