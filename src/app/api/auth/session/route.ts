import { NextResponse } from "next/server";
import { readSessionCookie, verifySession } from "@/lib/session";

export function GET(request: Request) {
  const session = verifySession(readSessionCookie(request.headers.get("cookie")));
  return NextResponse.json({ authenticated: Boolean(session), user: session ? { id: session.userId, username: session.username } : null }, { status: session ? 200 : 401 });
}
