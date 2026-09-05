import { notFound } from "next/navigation";

import { db } from "@/db/client";
import { SiteShell } from "@/components/layout/site-shell";
import { PostCard } from "@/components/posts/post-card";
import { getCategoryBySlug, listPublishedPostsByCategory } from "@/features/posts/repository";

type Props = Readonly<{ params: Promise<{ slug: string }> }>;
export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(db, slug);
  if (!category) notFound();
  const posts = listPublishedPostsByCategory(db, slug);
  return <SiteShell><header className="mb-12"><p className="text-sm text-blue-600">카테고리</p><h1 className="mt-2 text-4xl font-bold">{category.name}</h1>{category.description && <p className="mt-3 text-slate-600 dark:text-slate-300">{category.description}</p>}</header>{posts.length ? <div>{posts.map((post) => <PostCard key={post.id} post={post} />)}</div> : <p className="rounded-lg border border-dashed border-slate-300 px-6 py-12 text-center text-slate-500 dark:border-slate-700">이 카테고리에는 공개된 글이 없습니다.</p>}</SiteShell>;
}
