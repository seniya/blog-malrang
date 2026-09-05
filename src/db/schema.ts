import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
};

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    username: text("username").notNull(),
    passwordHash: text("password_hash").notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("users_username_unique").on(table.username)],
);

export const posts = sqliteTable(
  "posts",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    content: text("content").notNull(),
    coverImageUrl: text("cover_image_url"),
    status: text("status", { enum: ["draft", "published"] })
      .notNull()
      .default("draft"),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("posts_slug_unique").on(table.slug),
    index("posts_status_published_at_idx").on(table.status, table.publishedAt),
    check("posts_status_check", sql`${table.status} in ('draft', 'published')`),
  ],
);

export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull().default(""),
    ...timestamps,
  },
  (table) => [uniqueIndex("categories_slug_unique").on(table.slug)],
);

export const tags = sqliteTable(
  "tags",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("tags_slug_unique").on(table.slug)],
);

export const postCategories = sqliteTable(
  "post_categories",
  {
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.categoryId] }),
    index("post_categories_category_id_idx").on(table.categoryId),
  ],
);

export const postTags = sqliteTable(
  "post_tags",
  {
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.tagId] }),
    index("post_tags_tag_id_idx").on(table.tagId),
  ],
);

export const postsRelations = relations(posts, ({ many }) => ({
  categories: many(postCategories),
  tags: many(postTags),
}));
export const categoriesRelations = relations(categories, ({ many }) => ({ posts: many(postCategories) }));
export const tagsRelations = relations(tags, ({ many }) => ({ posts: many(postTags) }));
export const postCategoriesRelations = relations(postCategories, ({ one }) => ({
  post: one(posts, { fields: [postCategories.postId], references: [posts.id] }),
  category: one(categories, { fields: [postCategories.categoryId], references: [categories.id] }),
}));
export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, { fields: [postTags.postId], references: [posts.id] }),
  tag: one(tags, { fields: [postTags.tagId], references: [tags.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Tag = typeof tags.$inferSelect;
