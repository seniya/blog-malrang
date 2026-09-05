import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { hashPassword, verifyPassword } from "@/lib/password";
import { SESSION_MAX_AGE, sessionCookie, signSession, verifySession } from "@/lib/session";
import { checkLoginRateLimit, recordLoginFailure, sameOrigin } from "@/lib/auth";
import { validateSessionSecret } from "@/lib/env";

const requestFor = (headers: Record<string, string> = {}) => new Request("https://blog.malrang.net/api/auth/login", { headers });

describe("password authentication", () => {
  it("verifies the original password and rejects another", async () => {
    const hash = await hashPassword("correct horse battery staple");
    assert.equal(await verifyPassword("correct horse battery staple", hash), true);
    assert.equal(await verifyPassword("wrong password", hash), false);
    assert.notEqual(hash, "correct horse battery staple");
  });
});

describe("signed sessions", () => {
  it("round trips and expires", () => {
    const now = Date.now();
    const token = signSession("user-1", "admin", now);
    assert.deepEqual(verifySession(token, now), { userId: "user-1", username: "admin", exp: Math.floor(now / 1000) + SESSION_MAX_AGE });
    assert.equal(verifySession(token, now + (SESSION_MAX_AGE + 1) * 1000), null);
    assert.equal(verifySession(`${token}x`, now), null);
  });

  it("sets secure cookie attributes", () => {
    const cookie = sessionCookie("token");
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /Secure/);
    assert.match(cookie, /SameSite=Lax/);
  });
});

describe("authentication request hardening", () => {
  it("accepts a sufficiently long random secret and rejects weak placeholders", () => {
    const testSecret = "Q7v!2nR#9xL@4pK$8wM%3cD^6fH&1sJ*5zT";
    assert.equal(validateSessionSecret(testSecret), testSecret);
    assert.throws(() => validateSessionSecret("short"));
    assert.throws(() => validateSessionSecret("replace-with-a-random-32-character-secret"));
  });

  it("requires state-changing requests to use the same origin when Origin is sent", () => {
    assert.equal(sameOrigin(requestFor({ origin: "https://blog.malrang.net" })), true);
    assert.equal(sameOrigin(requestFor({ origin: "https://evil.example" })), false);
  });

  it("bounds failed login attempts per client IP", () => {
    const request = requestFor({ "x-forwarded-for": "198.51.100.77" });
    for (let attempt = 0; attempt < 5; attempt += 1) recordLoginFailure(request);
    const retryAfter = checkLoginRateLimit(request);
    assert.ok(retryAfter !== null && retryAfter > 0);
  });
});
