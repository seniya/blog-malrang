import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";
import { sameOrigin } from "@/lib/auth";

export function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const response = NextResponse.json({ authenticated: false });
  response.headers.set("Set-Cookie", clearSessionCookie());
  return response;
}
