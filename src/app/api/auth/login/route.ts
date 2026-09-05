import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/password";
import { sessionCookie, signSession } from "@/lib/session";
import { checkLoginRateLimit, clearLoginFailures, recordLoginFailure, sameOrigin } from "@/lib/auth";

const credentialsSchema = z.object({ username: z.string().min(1), password: z.string().min(1) });

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const retryAfter = checkLoginRateLimit(request);
  if (retryAfter) return NextResponse.json({ error: "Too many login attempts" }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
  let credentials: z.infer<typeof credentialsSchema>;
  try {
    credentials = credentialsSchema.parse(await request.json());
  } catch {
    recordLoginFailure(request);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }
  const user = db.select().from(users).where(eq(users.username, credentials.username)).get();
  if (!user || !(await verifyPassword(credentials.password, user.passwordHash))) {
    recordLoginFailure(request);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  clearLoginFailures(request);
  const response = NextResponse.json({ authenticated: true });
  response.headers.set("Set-Cookie", sessionCookie(signSession(user.id, user.username)));
  return response;
}
