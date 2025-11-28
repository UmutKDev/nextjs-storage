// Project-wide next-auth typings and access token shape
import "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    accessToken?: string;
    refreshToken?: string;
  }

  interface Session {
    accessToken?: string;
    accessTokenExpires?: number;
    refreshToken?: string;
    error?: string | null;
    user?: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    accessTokenExpires?: number;
    refreshToken?: string;
    id?: string;
  }
}
