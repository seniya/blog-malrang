import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { createDb } from "@/db/client";
import { categories, postCategories, postTags, posts, tags } from "@/db/schema";
import { createPost, deletePost, getPublishedCategoryBySlug, getPublishedPostBySlug, getPublishedTagBySlug, listAllPosts, listPublishedCategories, listPublishedPosts, listPublishedTags, updatePost } from "@/features/posts/repository";
import { postUpdateSchema } from "@/features/posts/validation";
import { deleteCategory, deleteTag } from "@/features/taxonomy/repository";

function testDb() {
  const database = createDb(":memory:");
  database.run("CREATE TABLE posts (id text primary key not null, title text not null, slug text not null unique, excerpt text default '' not null, content text not null, cover_image_url text, status text default 'draft' not null, published_at integer, created_at integer not null, updated_at integer not null, CHECK (status in ('draft','published')), CHECK ((status = 'published' and published_at is not null) or (status = 'draft' and published_at is null)))");
  database.run("CREATE TABLE categories (id text primary key not null, name text not null, slug text not null unique, description text default '' not null, created_at integer not null, updated_at integer not null)");
  database.run("CREATE TABLE tags (id text primary key not null, name text not null, slug text not null unique, created_at integer not null, updated_at integer not null)");
  database.run("CREATE TABLE post_categories (post_id text not null, category_id text not null, primary key (post_id, category_id))");
  database.run("CREATE TABLE post_tags (post_id text not null, tag_id text not null, primary key (post_id, tag_id))");
  return database;
}

describe("post repository", () => {
  it("published listing excludes drafts and orders newest first", () => {
    const database = testDb();
    createPost(database, { title: "Draft", slug: "draft", content: "hidden" });
    createPost(database, { title: "Older", slug: "older", content: "visible", status: "published", publishedAt: new Date("2024-01-01T00:00:00Z") });
    createPost(database, { title: "Newer", slug: "newer", content: "visible", status: "published", publishedAt: new Date("2024-02-01T00:00:00Z") });
    assert.deepEqual(listPublishedPosts(database).map((post) => post.slug), ["newer", "older"]);
    database.close();
  });

  it("partial updates do not apply create defaults or unpublish published posts", () => {
    const database = testDb();
    const published = createPost(database, { title: "Published", slug: "published", excerpt: "Keep this excerpt", content: "body", status: "published" });
    assert.deepEqual(postUpdateSchema.parse({}), {});
    const updated = updatePost(database, published.id, {});
    assert.equal(updated?.excerpt, "Keep this excerpt");
    assert.equal(updated?.status, "published");
    assert.ok(updated?.publishedAt);
    assert.equal(getPublishedPostBySlug(database, "published")?.id, published.id);
    const drafted = updatePost(database, published.id, { status: "draft" });
    assert.equal(drafted?.status, "draft");
    assert.equal(drafted?.publishedAt, null);
    assert.equal(getPublishedPostBySlug(database, "published"), undefined);
    database.close();
  });

  it("rejects invalid publication invariant", () => {
    const database = testDb();
    assert.throws(() => database.insert(posts).values({ title: "Invalid", slug: "invalid", content: "body", status: "published", publishedAt: null }).run());
    database.close();
  });

  it("public queries exclude future posts and draft-only taxonomies", () => {
    const database = testDb();
    const draft = createPost(database, { title: "Draft", slug: "draft-taxonomy", content: "hidden" });
    const future = createPost(database, { title: "Future", slug: "future-taxonomy", content: "hidden", status: "published", publishedAt: new Date(Date.now() + 86_400_000) });
    const visible = createPost(database, { title: "Visible", slug: "visible-taxonomy", content: "shown", status: "published" });
    const draftCategory = database.insert(categories).values({ name: "Draft category", slug: "draft-category" }).returning().get();
    const futureTag = database.insert(tags).values({ name: "Future tag", slug: "future-tag" }).returning().get();
    const visibleCategory = database.insert(categories).values({ name: "Visible category", slug: "visible-category" }).returning().get();
    const visibleTag = database.insert(tags).values({ name: "Visible tag", slug: "visible-tag" }).returning().get();
    database.insert(postCategories).values([{ postId: draft.id, categoryId: draftCategory.id }, { postId: visible.id, categoryId: visibleCategory.id }]).run();
    database.insert(postTags).values([{ postId: future.id, tagId: futureTag.id }, { postId: visible.id, tagId: visibleTag.id }]).run();
    assert.deepEqual(listPublishedPosts(database).map((post) => post.slug), ["visible-taxonomy"]);
    assert.deepEqual(listPublishedCategories(database).map((category) => category.slug), ["visible-category"]);
    assert.deepEqual(listPublishedTags(database).map((tag) => tag.slug), ["visible-tag"]);
    assert.equal(getPublishedPostBySlug(database, future.slug), undefined);
    assert.equal(getPublishedCategoryBySlug(database, "draft-category"), undefined);
    assert.equal(getPublishedTagBySlug(database, "future-tag"), undefined);
    database.close();
  });

  it("persists taxonomy assignments atomically and removes joins on deletion", () => {
    const database = testDb();
    const category = database.insert(categories).values({ name: "Engineering", slug: "engineering" }).returning().get();
    const tag = database.insert(tags).values({ name: "SQLite", slug: "sqlite" }).returning().get();
    const post = createPost(database, { title: "Taxonomy", slug: "taxonomy", content: "body", categoryIds: [category.id], tagIds: [tag.id] });
    assert.equal(database.select().from(postCategories).all().length, 1);
    assert.equal(database.select().from(postTags).all().length, 1);
    assert.throws(() => updatePost(database, post.id, { categoryIds: ["not-a-uuid"] }));
    assert.equal(database.select().from(postCategories).all().length, 1);
    deleteCategory(database, category.id);
    deleteTag(database, tag.id);
    assert.equal(database.select().from(postCategories).all().length, 0);
    assert.equal(database.select().from(postTags).all().length, 0);
    database.close();
  });

  it("supports admin filtering and deletion without exposing drafts publicly", () => {
    const database = testDb();
    const draft = createPost(database, { title: "Hidden draft", slug: "hidden-draft", content: "hidden" });
    const published = createPost(database, { title: "Visible post", slug: "visible-post", content: "shown", status: "published" });
    assert.deepEqual(listAllPosts(database, { status: "draft", search: "hidden" }).map((post) => post.id), [draft.id]);
    assert.equal(deletePost(database, draft.id), true);
    assert.equal(getPublishedPostBySlug(database, published.slug)?.id, published.id);
    assert.equal(getPublishedPostBySlug(database, draft.slug), undefined);
    database.close();
  });
});
