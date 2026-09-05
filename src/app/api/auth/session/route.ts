import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";

export function GET(request: Request) {
  const authenticated = getAuthenticatedSession(request);
  return NextResponse.json({ authenticated: Boolean(authenticated), user: authenticated ? { id: authenticated.user.id, username: authenticated.user.username } : null }, { status: authenticated ? 200 : 401 });
}
