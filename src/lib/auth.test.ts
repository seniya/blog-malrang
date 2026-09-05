import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { hashPassword, verifyPassword } from "@/lib/password";
import { SESSION_MAX_AGE, sessionCookie, signSession, verifySession } from "@/lib/session";

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
