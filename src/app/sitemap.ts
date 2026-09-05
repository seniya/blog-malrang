import type { MetadataRoute } from "next";

import { db } from "@/db/client";
import { listPublishedPosts } from "@/features/posts/repository";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = listPublishedPosts(db, 100);
  return [
    { url: env.NEXT_PUBLIC_SITE_URL, changeFrequency: "weekly", priority: 1 },
    ...posts.map((post) => ({ url: `${env.NEXT_PUBLIC_SITE_URL}/posts/${post.slug}`, lastModified: post.updatedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
