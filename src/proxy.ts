import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

function decode(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const bytes = Uint8Array.from(atob(normalized), (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function decodeBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(normalized), (character) => character.charCodeAt(0));
}

async function verifyEdgeSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [encoded, provided] = token.split(".");
  if (!encoded || !provided) return false;
  try {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.SESSION_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encoded)));
    const providedBytes = decodeBytes(provided);
    let difference = providedBytes.length ^ digest.length;
    const length = Math.max(providedBytes.length, digest.length);
    for (let index = 0; index < length; index += 1) difference |= (providedBytes[index] ?? 0) ^ (digest[index] ?? 0);
    const payload = JSON.parse(decode(encoded)) as { exp?: number; userId?: string; username?: string };
    return difference === 0 && Boolean(payload.userId && payload.username && payload.exp && payload.exp > Math.floor(Date.now() / 1000));
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login" || pathname.startsWith("/api/auth/")) return NextResponse.next();
  const cookie = request.cookies.get("blog_admin_session")?.value;
  if (await verifyEdgeSession(cookie)) return NextResponse.next();
  if (pathname.startsWith("/api/admin/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
