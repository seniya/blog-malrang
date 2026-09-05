import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

export function POST() {
  const response = NextResponse.json({ authenticated: false });
  response.headers.set("Set-Cookie", clearSessionCookie());
  return response;
}
