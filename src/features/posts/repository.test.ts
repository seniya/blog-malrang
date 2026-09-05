import assert from "node:assert/strict";
import { test } from "node:test";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import { createDb } from "@/db/client";
import { createPost, listPublishedPosts } from "@/features/posts/repository";
import { postInputSchema } from "@/features/posts/validation";

function testDb() {
  const database = createDb(":memory:");
  migrate(database, { migrationsFolder: "src/db/migrations" });
  return database;
}

test("post input validation rejects unsafe slugs and accepts a draft", () => {
  assert.equal(
    postInputSchema.safeParse({ title: "Draft", slug: "not valid", content: "body" }).success,
    false,
  );
  const parsed = postInputSchema.parse({ title: "Draft", slug: "a-draft", content: "body" });
  assert.equal(parsed.status, "draft");
  assert.equal(parsed.excerpt, "");
});

test("published listing excludes drafts and orders newest first", () => {
  const database = testDb();
  createPost(database, { title: "Draft", slug: "draft", content: "hidden" });
  createPost(database, {
    title: "Older",
    slug: "older",
    content: "visible",
    status: "published",
    publishedAt: new Date("2024-01-01T00:00:00Z"),
  });
  createPost(database, {
    title: "Newer",
    slug: "newer",
    content: "visible",
    status: "published",
    publishedAt: new Date("2024-02-01T00:00:00Z"),
  });

  const posts = listPublishedPosts(database);
  assert.deepEqual(posts.map((post) => post.slug), ["newer", "older"]);
});
