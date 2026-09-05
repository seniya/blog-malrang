import { and, desc, eq, isNotNull, lte, sql } from "drizzle-orm";

import type { Db } from "@/db/client";
import { categories, postCategories, postTags, posts, tags, type Category, type Post, type Tag } from "@/db/schema";
import { postInputSchema, postUpdateSchema, type PostInput, type PostUpdate } from "@/features/posts/validation";

export type PostRepository = Pick<Db, "select" | "selectDistinct" | "insert" | "update" | "delete">;

const publishedNow = () => and(eq(posts.status, "published"), isNotNull(posts.publishedAt), lte(posts.publishedAt, new Date()));

/** Public query boundary: only currently published posts cross this function. */
export function listPublishedPosts(database: PostRepository, limit?: number): Post[] {
  const query = database.select().from(posts).where(publishedNow()).orderBy(desc(posts.publishedAt), desc(posts.createdAt));
  return (limit === undefined ? query : query.limit(Math.max(1, Math.min(limit, 100)))).all();
}

/** Public query boundary for a single post. */
export function getPublishedPostBySlug(database: PostRepository, slug: string): Post | undefined {
  return database.select().from(posts).where(and(eq(posts.slug, slug), publishedNow())).all().at(0);
}

export function getCategoryBySlug(database: PostRepository, slug: string): Category | undefined {
  return database.select().from(categories).where(eq(categories.slug, slug)).get();
}

export function getTagBySlug(database: PostRepository, slug: string): Tag | undefined {
  return database.select().from(tags).where(eq(tags.slug, slug)).get();
}

export function listPublishedCategories(database: PostRepository): Category[] {
  return database
    .selectDistinct({ category: categories })
    .from(categories)
    .innerJoin(postCategories, eq(postCategories.categoryId, categories.id))
    .innerJoin(posts, eq(posts.id, postCategories.postId))
    .where(publishedNow())
    .orderBy(categories.name)
    .all()
    .map(({ category }) => category);
}

export function listPublishedTags(database: PostRepository): Tag[] {
  return database
    .selectDistinct({ tag: tags })
    .from(tags)
    .innerJoin(postTags, eq(postTags.tagId, tags.id))
    .innerJoin(posts, eq(posts.id, postTags.postId))
    .where(publishedNow())
    .orderBy(tags.name)
    .all()
    .map(({ tag }) => tag);
}

export function getPublishedCategoryBySlug(database: PostRepository, slug: string): Category | undefined {
  return listPublishedCategories(database).find((category) => category.slug === slug);
}

export function getPublishedTagBySlug(database: PostRepository, slug: string): Tag | undefined {
  return listPublishedTags(database).find((tag) => tag.slug === slug);
}

export function listPublishedPostsByCategory(database: PostRepository, categorySlug: string, limit = 100): Post[] {
  return database
    .select({ post: posts })
    .from(posts)
    .innerJoin(postCategories, eq(postCategories.postId, posts.id))
    .innerJoin(categories, eq(categories.id, postCategories.categoryId))
    .where(and(eq(categories.slug, categorySlug), publishedNow()))
    .orderBy(desc(posts.publishedAt), desc(posts.createdAt))
    .limit(Math.max(1, Math.min(limit, 100)))
    .all()
    .map(({ post }) => post);
}

export function listPublishedPostsByTag(database: PostRepository, tagSlug: string, limit = 100): Post[] {
  return database
    .select({ post: posts })
    .from(posts)
    .innerJoin(postTags, eq(postTags.postId, posts.id))
    .innerJoin(tags, eq(tags.id, postTags.tagId))
    .where(and(eq(tags.slug, tagSlug), publishedNow()))
    .orderBy(desc(posts.publishedAt), desc(posts.createdAt))
    .limit(Math.max(1, Math.min(limit, 100)))
    .all()
    .map(({ post }) => post);
}

/** Admin-only query boundary; callers must perform authorization before calling. */
export function listAllPosts(database: PostRepository, filters?: { status?: "draft" | "published"; search?: string }): Post[] {
  const conditions = [];
  if (filters?.status) conditions.push(eq(posts.status, filters.status));
  if (filters?.search) {
    const term = `%${filters.search.replace(/[\\%_]/g, "\\$&").toLowerCase()}%`;
    conditions.push(sql`(lower(${posts.title}) like ${term} escape '\\' or lower(${posts.slug}) like ${term} escape '\\')`);
  }
  return database.select().from(posts).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(posts.updatedAt)).all();
}

export function getPostById(database: PostRepository, id: string): Post | undefined {
  return database.select().from(posts).where(eq(posts.id, id)).get();
}

export function createPost(database: PostRepository, input: PostInput): Post {
  const parsed = postInputSchema.parse(input);
  const now = new Date();
  const publishedAt = parsed.status === "published" ? (parsed.publishedAt ?? now) : null;
  return database.insert(posts).values({ ...parsed, publishedAt, createdAt: now, updatedAt: now }).returning().get();
}

export function updatePost(database: PostRepository, id: string, input: PostUpdate): Post | undefined {
  const parsed = postUpdateSchema.parse(input);
  const current = getPostById(database, id);
  if (!current) return undefined;
  const nextStatus = parsed.status ?? current.status;
  const nextPublishedAt = nextStatus === "draft" ? null : parsed.publishedAt ?? current.publishedAt ?? new Date();
  return database.update(posts).set({ ...parsed, status: nextStatus, publishedAt: nextPublishedAt, updatedAt: new Date() }).where(eq(posts.id, id)).returning().get();
}

export function deletePost(database: PostRepository, id: string): boolean {
  return database.delete(posts).where(eq(posts.id, id)).returning().all().length === 1;
}
