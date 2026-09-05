import type { MetadataRoute } from "next";

import { db } from "@/db/client";
import { listPublishedCategories, listPublishedPosts, listPublishedTags } from "@/features/posts/repository";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = listPublishedPosts(db);
  const categories = listPublishedCategories(db);
  const tags = listPublishedTags(db);
  return [
    { url: env.NEXT_PUBLIC_SITE_URL, changeFrequency: "weekly", priority: 1 },
    ...posts.map((post) => ({ url: `${env.NEXT_PUBLIC_SITE_URL}/posts/${post.slug}`, lastModified: post.updatedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...categories.map((category) => ({ url: `${env.NEXT_PUBLIC_SITE_URL}/categories/${category.slug}`, lastModified: category.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...tags.map((tag) => ({ url: `${env.NEXT_PUBLIC_SITE_URL}/tags/${tag.slug}`, lastModified: tag.updatedAt, changeFrequency: "weekly" as const, priority: 0.5 })),
  ];
}
