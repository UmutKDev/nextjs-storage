"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getDefaultQueryClient } from "@/lib/queryClient";

export default function Providers({ children }: { children: React.ReactNode }) {
  // SessionProvider enables useSession/useSession hooks in client components
  const queryClient = getDefaultQueryClient();
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        {/* Devtools only show up in development */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 4000,
          style: {
            // color: "#fff",
            // background: "rgba(0, 10, 10, 10)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            borderRadius: "8px",
            padding: "12px 16px",
            zIndex: 9999,
          },
        }}
      />
    </SessionProvider>
  );
}
