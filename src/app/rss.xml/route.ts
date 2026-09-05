import { NextResponse } from "next/server";

import { db } from "@/db/client";
import { listPublishedPosts } from "@/features/posts/repository";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export function GET() {
  const posts = listPublishedPosts(db, 50);
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const items = posts.map((post) => {
    const url = `${siteUrl}/posts/${post.slug}`;
    return `<item><title>${escapeXml(post.title)}</title><link>${escapeXml(url)}</link><guid isPermaLink="true">${escapeXml(url)}</guid><description>${escapeXml(post.excerpt)}</description>${post.publishedAt ? `<pubDate>${escapeXml(post.publishedAt.toUTCString())}</pubDate>` : ""}</item>`;
  }).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0"><channel><title>${escapeXml("blog.malrang.net")}</title><link>${escapeXml(siteUrl)}</link><description>${escapeXml("개발과 일상을 기록하는 개인 블로그")}</description><language>${escapeXml("ko")}</language>${items}</channel></rss>`;
  return new NextResponse(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
