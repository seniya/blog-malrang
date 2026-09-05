import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { categories, postCategories, posts, postTags, tags } from "@/db/schema";

const now = new Date();

const category = db
  .insert(categories)
  .values({ name: "개발", slug: "development", description: "개발과 기술에 관한 글", createdAt: now, updatedAt: now })
  .onConflictDoNothing({ target: categories.slug })
  .returning()
  .all()[0];
const selectedCategory = category ?? db.select().from(categories).where(eq(categories.slug, "development")).get();

const tag = db
  .insert(tags)
  .values({ name: "시작하기", slug: "getting-started", createdAt: now, updatedAt: now })
  .onConflictDoNothing({ target: tags.slug })
  .returning()
  .all()[0];
const selectedTag = tag ?? db.select().from(tags).where(eq(tags.slug, "getting-started")).get();

const post = db
  .insert(posts)
  .values({
    title: "blog.malrang.net 시작하기",
    slug: "welcome",
    excerpt: "개인 블로그를 시작하며 기록하는 첫 글입니다.",
    content: "# 시작하기\n\n이 글은 seed 명령으로 생성된 샘플 게시글입니다.",
    status: "published",
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  })
  .onConflictDoNothing({ target: posts.slug })
  .returning()
  .all()[0];
const selectedPost = post ?? db.select().from(posts).where(eq(posts.slug, "welcome")).get();

if (selectedPost && selectedCategory) {
  db.insert(postCategories)
    .values({ postId: selectedPost.id, categoryId: selectedCategory.id })
    .onConflictDoNothing()
    .run();
}
if (selectedPost && selectedTag) {
  db.insert(postTags)
    .values({ postId: selectedPost.id, tagId: selectedTag.id })
    .onConflictDoNothing()
    .run();
}

console.log(`Seeded sample post: ${selectedPost?.slug ?? "none"}`);
