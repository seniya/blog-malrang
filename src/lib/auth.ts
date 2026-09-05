import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import type { Db } from "@/db/client";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { readSessionCookie, verifySession } from "@/lib/session";

const LOGIN_WINDOW_MS = 60_000;
const LOGIN_MAX_FAILURES = 5;
const LOGIN_MAX_TRACKED_IPS = 10_000;
const loginFailures = new Map<string, { count: number; resetAt: number }>();

export function getSession(request: Request) {
  return verifySession(readSessionCookie(request.headers.get("cookie")));
}

export function getAuthenticatedSession(request: Request, database: Db = db) {
  const session = getSession(request);
  if (!session) return null;
  const user = database.select().from(users).where(eq(users.id, session.userId)).get();
  return user ? { session, user } : null;
}

export function requireAdmin(request: Request): NextResponse | null {
  if (!getAuthenticatedSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
  return null;
}

export function adminPageRedirect(request: Request): URL | null {
  return getAuthenticatedSession(request) ? null : new URL("/admin/login", request.url);
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function checkLoginRateLimit(request: Request): number | null {
  const now = Date.now();
  for (const [ip, entry] of loginFailures) if (entry.resetAt <= now) loginFailures.delete(ip);
  const entry = loginFailures.get(clientIp(request));
  if (!entry || entry.resetAt <= now || entry.count < LOGIN_MAX_FAILURES) return null;
  return Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
}

export function recordLoginFailure(request: Request): void {
  const now = Date.now();
  const ip = clientIp(request);
  const current = loginFailures.get(ip);
  if (loginFailures.size >= LOGIN_MAX_TRACKED_IPS && !current) {
    const oldest = loginFailures.keys().next().value;
    if (oldest) loginFailures.delete(oldest);
  }
  if (!current || current.resetAt <= now) loginFailures.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
  else current.count += 1;
}

export function clearLoginFailures(request: Request): void {
  loginFailures.delete(clientIp(request));
}
