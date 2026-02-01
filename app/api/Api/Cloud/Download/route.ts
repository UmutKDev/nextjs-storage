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
    req.headers.get("x-folder-session") ||
    req.headers.get("X-Folder-Session");

  const upstreamParams = new URLSearchParams(searchParams);
  upstreamParams.set("Key", key);
  upstreamParams.delete("folderSession");
  upstreamParams.delete("x-folder-session");
  upstreamParams.delete("X-Folder-Session");
  upstreamParams.delete("w");
  upstreamParams.delete("h");

  const upstreamUrl = `${API_URL}/Api/Cloud/Download?${upstreamParams.toString()}`;

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
  responseHeaders.set("Cache-Control", "private, no-store");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
