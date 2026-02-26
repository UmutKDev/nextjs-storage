"use client";

import React from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { setClientToken } from "@/Service/Instance";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getDefaultQueryClient } from "@/lib/queryClient";
import { accountSecurityApiFactory } from "@/Service/Factories";
import { NotificationProvider } from "@/features/notifications";

export default function Providers({ children }: { children: React.ReactNode }) {
  // SessionProvider enables useSession/useSession hooks in client components
  const queryClient = getDefaultQueryClient();
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          {children}
        </NotificationProvider>
        <AuthTokenSync />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}

function AuthTokenSync() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If we have a session ID, set it for API calls
    const sessionId = session?.sessionId ?? session?.user?.sessionId ?? null;
    setClientToken(sessionId);

    // Check for 2FA requirement
    if (status === "authenticated" && session?.requiresTwoFactor) {
      if (pathname !== "/authentication/2fa") {
        router.push("/authentication/2fa");
        return;
      }
    }

    // Explicit Session Validation on Load via /Api/Authentication/Sessions
    if (status === "authenticated" && sessionId) {
      accountSecurityApiFactory.getSessions().catch((err) => {
        // 401 errors are handled by Instance interceptor (triggering signOut)
        // Other errors are ignored (e.g. network error)
        if (process.env.NODE_ENV === "development") {
          console.warn("[AuthTokenSync] Session check failed", err);
        }
      });
    }
  }, [session, status, router, pathname]);

  return null;
}
