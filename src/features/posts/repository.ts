import { and, desc, eq, inArray, isNotNull, lte, sql } from "drizzle-orm";

import type { Db } from "@/db/client";
import { categories, postCategories, postTags, posts, tags, type Category, type Post, type Tag } from "@/db/schema";
import { postInputSchema, postUpdateSchema, type PostInput, type PostUpdate } from "@/features/posts/validation";

export type PostRepository = Pick<Db, "select" | "selectDistinct" | "insert" | "update" | "delete"> & { transaction?: (callback: (database: PostRepository) => unknown) => unknown };
export type PostWithTaxonomy = Post & { categories: Pick<Category, "id" | "name" | "slug">[]; tags: Pick<Tag, "id" | "name" | "slug">[] };

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

export function listPublishedPostsByCategory(database: PostRepository, categorySlug: string, limit = 100): PostWithTaxonomy[] {
  return withTaxonomy(database, database
    .select({ post: posts })
    .from(posts)
    .innerJoin(postCategories, eq(postCategories.postId, posts.id))
    .innerJoin(categories, eq(categories.id, postCategories.categoryId))
    .where(and(eq(categories.slug, categorySlug), publishedNow()))
    .orderBy(desc(posts.publishedAt), desc(posts.createdAt))
    .limit(Math.max(1, Math.min(limit, 100)))
    .all()
    .map(({ post }) => post));
}

export function listPublishedPostsByTag(database: PostRepository, tagSlug: string, limit = 100): PostWithTaxonomy[] {
  return withTaxonomy(database, database
    .select({ post: posts })
    .from(posts)
    .innerJoin(postTags, eq(postTags.postId, posts.id))
    .innerJoin(tags, eq(tags.id, postTags.tagId))
    .where(and(eq(tags.slug, tagSlug), publishedNow()))
    .orderBy(desc(posts.publishedAt), desc(posts.createdAt))
    .limit(Math.max(1, Math.min(limit, 100)))
    .all()
    .map(({ post }) => post));
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
  const { categoryIds, tagIds, ...postValues } = parsed;
  const save = (target: PostRepository) => {
    const post = target.insert(posts).values({ ...postValues, publishedAt, createdAt: now, updatedAt: now }).returning().get();
    replacePostTaxonomy(target, post.id, categoryIds, tagIds);
    return post;
  };
  return (database.transaction ? database.transaction(save) : save(database)) as Post;
}

export function updatePost(database: PostRepository, id: string, input: PostUpdate): Post | undefined {
  const parsed = postUpdateSchema.parse(input);
  const { categoryIds, tagIds, ...postValues } = parsed;
  const save = (target: PostRepository) => {
    const current = getPostById(target, id);
    if (!current) return undefined;
    const nextStatus = parsed.status ?? current.status;
    const nextPublishedAt = nextStatus === "draft" ? null : parsed.publishedAt ?? current.publishedAt ?? new Date();
    const post = target.update(posts).set({ ...postValues, status: nextStatus, publishedAt: nextPublishedAt, updatedAt: new Date() }).where(eq(posts.id, id)).returning().get();
    if (categoryIds !== undefined || tagIds !== undefined) {
      const currentTaxonomy = getPostTaxonomy(target, id);
      replacePostTaxonomy(target, id, categoryIds ?? currentTaxonomy.categoryIds, tagIds ?? currentTaxonomy.tagIds);
    }
    return post;
  };
  return (database.transaction ? database.transaction(save) : save(database)) as Post | undefined;
}

export function getPostTaxonomy(database: PostRepository, postId: string) {
  return {
    categoryIds: database.select({ id: postCategories.categoryId }).from(postCategories).where(eq(postCategories.postId, postId)).all().map((row) => row.id),
    tagIds: database.select({ id: postTags.tagId }).from(postTags).where(eq(postTags.postId, postId)).all().map((row) => row.id),
  };
}

export function getPostTaxonomyNames(database: PostRepository, postId: string) {
  return {
    categories: database.select({ id: categories.id, name: categories.name, slug: categories.slug }).from(postCategories).innerJoin(categories, eq(categories.id, postCategories.categoryId)).where(eq(postCategories.postId, postId)).all(),
    tags: database.select({ id: tags.id, name: tags.name, slug: tags.slug }).from(postTags).innerJoin(tags, eq(tags.id, postTags.tagId)).where(eq(postTags.postId, postId)).all(),
  };
}

function withTaxonomy(database: PostRepository, rows: Post[]): PostWithTaxonomy[] { return rows.map((post) => ({ ...post, ...getPostTaxonomyNames(database, post.id) })); }

export function replacePostTaxonomy(database: PostRepository, postId: string, categoryIds: string[], tagIds: string[]) {
  const categoryCount = database.select({ id: categories.id }).from(categories).where(inArray(categories.id, categoryIds)).all().length;
  const tagCount = database.select({ id: tags.id }).from(tags).where(inArray(tags.id, tagIds)).all().length;
  if (categoryCount !== new Set(categoryIds).size) throw new Error("Invalid category ID");
  if (tagCount !== new Set(tagIds).size) throw new Error("Invalid tag ID");
  database.delete(postCategories).where(eq(postCategories.postId, postId)).run();
  database.delete(postTags).where(eq(postTags.postId, postId)).run();
  if (categoryIds.length) database.insert(postCategories).values(categoryIds.map((categoryId) => ({ postId, categoryId }))).run();
  if (tagIds.length) database.insert(postTags).values(tagIds.map((tagId) => ({ postId, tagId }))).run();
}

export function deletePost(database: PostRepository, id: string): boolean {
  return database.delete(posts).where(eq(posts.id, id)).returning().all().length === 1;
}
