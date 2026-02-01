// Project-wide next-auth typings and access token shape
import "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    sessionId?: string;
    expiresAt?: string;
    requiresTwoFactor?: boolean;
    role?: string;
  }

  interface Session {
    sessionId?: string;
    expiresAt?: string;
    requiresTwoFactor?: boolean;
    error?: string | null;
    user?: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sessionId?: string;
    expiresAt?: string;
    requiresTwoFactor?: boolean;
    id?: string;
  }
}
