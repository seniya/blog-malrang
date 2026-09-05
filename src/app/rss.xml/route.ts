import { NextResponse } from "next/server";

import { db } from "@/db/client";
import { listPublishedPosts } from "@/features/posts/repository";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export function GET() {
  const posts = listPublishedPosts(db, 50);
  const items = posts.map((post) => `<item><title>${escapeXml(post.title)}</title><link>${env.NEXT_PUBLIC_SITE_URL}/posts/${post.slug}</link><guid isPermaLink="true">${env.NEXT_PUBLIC_SITE_URL}/posts/${post.slug}</guid><description>${escapeXml(post.excerpt)}</description>${post.publishedAt ? `<pubDate>${post.publishedAt.toUTCString()}</pubDate>` : ""}</item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0"><channel><title>blog.malrang.net</title><link>${env.NEXT_PUBLIC_SITE_URL}</link><description>개발과 일상을 기록하는 개인 블로그</description><language>ko</language>${items}</channel></rss>`;
  return new NextResponse(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
