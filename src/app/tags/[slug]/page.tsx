import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { db } from "@/db/client";
import { SiteShell } from "@/components/layout/site-shell";
import { PostCard } from "@/components/posts/post-card";
import { getPublishedTagBySlug, listPublishedPostsByTag } from "@/features/posts/repository";
import { env } from "@/lib/env";

type Props = Readonly<{ params: Promise<{ slug: string }> }>;
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = getPublishedTagBySlug(db, slug);
  if (!tag) return { title: "태그를 찾을 수 없습니다" };
  return { title: `#${tag.name}`, alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/tags/${tag.slug}` } };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const tag = getPublishedTagBySlug(db, slug);
  if (!tag) notFound();
  const posts = listPublishedPostsByTag(db, slug);
  return <SiteShell><header className="mb-12"><p className="text-sm text-blue-600">태그</p><h1 className="mt-2 text-4xl font-bold">#{tag.name}</h1></header>{posts.length ? <div>{posts.map((post) => <PostCard key={post.id} post={post} />)}</div> : <p className="rounded-lg border border-dashed border-slate-300 px-6 py-12 text-center text-slate-500 dark:border-slate-700">이 태그에는 공개된 글이 없습니다.</p>}</SiteShell>;
}
