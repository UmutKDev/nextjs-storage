import { API_URL } from "@/Constants";
import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("Key") || searchParams.get("key");

  if (!key) {
    return NextResponse.json({ message: "Key is required." }, { status: 400 });
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || typeof token.accessToken !== "string") {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const folderSession =
    searchParams.get("folderSession") ||
    searchParams.get("x-folder-session") ||
    searchParams.get("X-Folder-Session");

  const upstreamUrl = `${API_URL}/Api/Cloud/Download?Key=${encodeURIComponent(
    key
  )}`;

  const headers: HeadersInit = {
    Authorization: `Bearer ${token.accessToken}`,
  };

  const range = req.headers.get("range");
  if (range) {
    headers.Range = range;
  }

  if (folderSession) {
    headers["X-Folder-Session"] = folderSession;
  }

  const upstream = await fetch(upstreamUrl, { headers });
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("set-cookie");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
