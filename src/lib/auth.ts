import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { readSessionCookie, verifySession } from "@/lib/session";

export function getSession(request: Request) {
  return verifySession(readSessionCookie(request.headers.get("cookie")));
}

export function requireAdmin(request: Request): NextResponse | null {
  const session = getSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = db.select({ id: users.id }).from(users).where(eq(users.id, session.userId)).get();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export function adminPageRedirect(request: Request): URL | null {
  return getSession(request) ? null : new URL("/admin/login", request.url);
}
