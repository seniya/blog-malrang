import { asc, eq } from "drizzle-orm";
import type { Db } from "@/db/client";
import { categories, postCategories, postTags, tags, type Category, type Tag } from "@/db/schema";

export type TaxonomyDb = Pick<Db, "select" | "insert" | "update" | "delete">;
export const slugify = (value: string) => value.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 100);
export function listCategories(db: TaxonomyDb): Category[] { return db.select().from(categories).orderBy(asc(categories.name)).all(); }
export function listTags(db: TaxonomyDb): Tag[] { return db.select().from(tags).orderBy(asc(tags.name)).all(); }
export function createCategory(db: TaxonomyDb, input: { name: string; slug?: string; description?: string }) { const now = new Date(); return db.insert(categories).values({ name: input.name.trim(), slug: input.slug || slugify(input.name), description: input.description?.trim() ?? "", createdAt: now, updatedAt: now }).returning().get(); }
export function createTag(db: TaxonomyDb, input: { name: string; slug?: string }) { const now = new Date(); return db.insert(tags).values({ name: input.name.trim(), slug: input.slug || slugify(input.name), createdAt: now, updatedAt: now }).returning().get(); }
export function updateCategory(db: TaxonomyDb, id: string, input: { name?: string; slug?: string; description?: string }) { return db.update(categories).set({ ...input, updatedAt: new Date() }).where(eq(categories.id, id)).returning().get(); }
export function updateTag(db: TaxonomyDb, id: string, input: { name?: string; slug?: string }) { return db.update(tags).set({ ...input, updatedAt: new Date() }).where(eq(tags.id, id)).returning().get(); }
export function deleteCategory(db: TaxonomyDb, id: string) { db.delete(postCategories).where(eq(postCategories.categoryId, id)).run(); return db.delete(categories).where(eq(categories.id, id)).returning().all().length === 1; }
export function deleteTag(db: TaxonomyDb, id: string) { db.delete(postTags).where(eq(postTags.tagId, id)).run(); return db.delete(tags).where(eq(tags.id, id)).returning().all().length === 1; }
