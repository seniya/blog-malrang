import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/password";
import { sessionCookie, signSession } from "@/lib/session";

const credentialsSchema = z.object({ username: z.string().min(1), password: z.string().min(1) });

export async function POST(request: Request) {
  let credentials: z.infer<typeof credentialsSchema>;
  try {
    credentials = credentialsSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }
  const user = db.select().from(users).where(eq(users.username, credentials.username)).get();
  if (!user || !(await verifyPassword(credentials.password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const response = NextResponse.json({ authenticated: true });
  response.headers.set("Set-Cookie", sessionCookie(signSession(user.id, user.username)));
  return response;
}
