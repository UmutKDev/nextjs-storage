"use client";

import React from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setClientToken } from "@/Service/Instance";
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
        {/* Sync next-auth session -> Instance token cache once here so we don't call getSession per request */}
        <AuthTokenSync />
        {/* Devtools only show up in development */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: "text-sm font-medium",
          style: {
            background: "#fff",
            color: "#0f172a", // slate-950
            border: "1px solid #e2e8f0", // slate-200
            padding: "12px 16px",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            borderRadius: "6px",
          },
          error: {
            style: {
              borderLeft: "4px solid #ef4444", // red-500
            },
          },
          success: {
            style: {
              borderLeft: "4px solid #22c55e", // green-500
            },
          },
        }}
      />
    </SessionProvider>
  );
}

function AuthTokenSync() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If we have a session ID, set it for API calls
    const sessionId = session?.sessionId ?? session?.user?.sessionId ?? null;
    setClientToken(sessionId);

    // Check for 2FA requirement
    if (status === "authenticated" && session?.requiresTwoFactor) {
      // Avoid infinite redirect if we are already on 2fa page
      if (window.location.pathname !== "/auth/2fa") {
        router.push("/auth/2fa");
      }
    }
  }, [session, status, router]);

  return null;
}
