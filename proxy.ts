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

  // only act for the authentication page route(s)
  if (pathname.startsWith("/authentication")) {
    // getToken checks the request cookies for a valid next-auth JWT
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (token) {
      // already authenticated -> redirect away from login
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/authentication", "/authentication/:path*"],
};
