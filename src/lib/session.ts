import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

export const SESSION_COOKIE = "blog_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

type SessionPayload = { userId: string; username: string; exp: number };

function encode(value: string): string {
  return Buffer.from(value).toString("base64url");
}
function decode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}
function signature(input: string): string {
  return createHmac("sha256", env.SESSION_SECRET).update(input).digest("base64url");
}

export function signSession(userId: string, username: string, now = Date.now()): string {
  const payload: SessionPayload = { userId, username, exp: Math.floor(now / 1000) + SESSION_MAX_AGE };
  const encoded = encode(JSON.stringify(payload));
  return `${encoded}.${signature(encoded)}`;
}

export function verifySession(token: string | undefined, now = Date.now()): SessionPayload | null {
  if (!token) return null;
  const [encoded, provided] = token.split(".");
  if (!encoded || !provided) return null;
  const expected = signature(encoded);
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const payload = JSON.parse(decode(encoded)) as SessionPayload;
    if (!payload.userId || !payload.username || !Number.isInteger(payload.exp) || payload.exp <= Math.floor(now / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Max-Age=${SESSION_MAX_AGE}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

export function readSessionCookie(cookieHeader: string | null): string | undefined {
  return cookieHeader?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
}
