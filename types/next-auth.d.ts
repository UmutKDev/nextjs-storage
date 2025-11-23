// Project-wide next-auth typings and access token shape
import 'next-auth';

interface AccessTokenPayload {
  // Basic fields returned by your backend's JWT
  id: string;
  fullName?: string;
  email?: string;
  iat?: number;
  exp?: number;
  [k: string]: any;
}

declare module "next-auth" {
  interface User {
    id?: string;
    accessToken?: string;
    refreshToken?: string;
  }

  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user?: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    id?: string;
  }
}
