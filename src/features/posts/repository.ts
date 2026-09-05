import { desc, eq } from "drizzle-orm";

import type { Db } from "@/db/client";
import { posts, type Post } from "@/db/schema";
import { postInputSchema, postUpdateSchema, type PostInput, type PostUpdate } from "@/features/posts/validation";

export type PostRepository = Pick<Db, "select" | "insert" | "update" | "delete">;

/** Public query boundary: drafts must never cross this function. */
export function listPublishedPosts(database: PostRepository, limit = 20): Post[] {
  return database
    .select()
    .from(posts)
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedAt), desc(posts.createdAt))
    .limit(Math.max(1, Math.min(limit, 100)))
    .all();
}

/** Public query boundary for a single post. */
export function getPublishedPostBySlug(database: PostRepository, slug: string): Post | undefined {
  return database
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .all()
    .find((post) => post.status === "published");
}

/** Admin-only query boundary; callers must perform authorization in a later phase. */
export function listAllPosts(database: PostRepository): Post[] {
  return database.select().from(posts).orderBy(desc(posts.updatedAt)).all();
}

export function getPostById(database: PostRepository, id: string): Post | undefined {
  return database.select().from(posts).where(eq(posts.id, id)).get();
}

export function createPost(database: PostRepository, input: PostInput): Post {
  const parsed = postInputSchema.parse(input);
  const now = new Date();
  const publishedAt = parsed.status === "published" ? (parsed.publishedAt ?? now) : null;
  return database
    .insert(posts)
    .values({ ...parsed, publishedAt, createdAt: now, updatedAt: now })
    .returning()
    .get();
}

export function updatePost(database: PostRepository, id: string, input: PostUpdate): Post | undefined {
  const parsed = postUpdateSchema.parse(input);
  const current = getPostById(database, id);
  if (!current) return undefined;

  const nextStatus = parsed.status ?? current.status;
  const nextPublishedAt =
    nextStatus === "draft"
      ? null
      : parsed.publishedAt ?? current.publishedAt ?? new Date();

  return database
    .update(posts)
    .set({ ...parsed, status: nextStatus, publishedAt: nextPublishedAt, updatedAt: new Date() })
    .where(eq(posts.id, id))
    .returning()
    .get();
}

export function deletePost(database: PostRepository, id: string): boolean {
  return database.delete(posts).where(eq(posts.id, id)).returning().all().length === 1;
}
