import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Middleware: redirect authenticated users away from the authentication page.
 *
 * - When a request targets `/authentication` (or any sub-path) and the user
 *   already has a valid next-auth token, redirect to `/`.
 * - Keep the middleware small and limited via `matcher` below.
 *
 * Note: this requires NEXTAUTH_SECRET to be set in environment variables.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // only act for the authentication page route(s)
  if (!token && pathname.startsWith("/storage")) {
    // getToken checks the request cookies for a valid next-auth JWT
    return NextResponse.redirect(new URL("/authentication", req.url));
  } else if (token && pathname.startsWith("/authentication")) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();

  if (token) {
    res.headers.set("Authorization", `Bearer ${token.accessToken}`);
    req.headers.set("Authorization", `Bearer ${token.accessToken}`);
  }

  return res;
}

export const config = {
  matcher: [
    "/authentication",
    "/authentication/:path*",
    "/storage",
    "/storage/:path*",
  ],
};
