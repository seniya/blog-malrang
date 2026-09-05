import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { db } from "@/db/client";
import { SiteShell } from "@/components/layout/site-shell";
import { Markdown } from "@/components/posts/markdown";
import { formatDate } from "@/components/posts/post-card";
import { getPostTaxonomyNames, getPublishedPostBySlug } from "@/features/posts/repository";
import { env } from "@/lib/env";

type Props = Readonly<{ params: Promise<{ slug: string }> }>;
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPublishedPostBySlug(db, slug);
  if (!post) return { title: "글을 찾을 수 없습니다" };
  return { title: post.title, description: post.excerpt || undefined, alternates: { canonical: `/posts/${post.slug}` }, openGraph: { title: post.title, description: post.excerpt || undefined, url: `${env.NEXT_PUBLIC_SITE_URL}/posts/${post.slug}`, type: "article", publishedTime: post.publishedAt?.toISOString() } };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPublishedPostBySlug(db, slug);
  if (!post) notFound();
  const taxonomy = getPostTaxonomyNames(db, post.id);
  return <SiteShell><article className="mx-auto max-w-3xl"><header className="mb-10 border-b border-slate-200 pb-8 dark:border-slate-800"><p className="mb-3 text-sm text-slate-500">{formatDate(post.publishedAt)}</p><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{post.title}</h1>{post.excerpt && <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">{post.excerpt}</p>}<p className="mt-4 text-sm text-slate-500">{taxonomy.categories.map((item) => item.name).join(" · ")} {taxonomy.tags.map((item) => `#${item.name}`).join(" ")}</p></header><Markdown content={post.content} /></article></SiteShell>;
}
