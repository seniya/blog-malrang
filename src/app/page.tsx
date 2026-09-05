import { listPublishedPosts } from "@/features/posts/repository";
import { db } from "@/db/client";
import { PostCard } from "@/components/posts/post-card";
import { SiteShell } from "@/components/layout/site-shell";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const posts = listPublishedPosts(db, 20);
  return <SiteShell><section className="mb-14 max-w-2xl"><p className="mb-4 text-sm font-medium text-blue-600">blog.malrang.net</p><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">기록하고, 나누고,<br />다시 배우는 공간</h1><p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">개발과 일상에 관한 글을 차곡차곡 쌓아가는 개인 블로그입니다.</p></section><section aria-labelledby="latest-heading"><h2 id="latest-heading" className="mb-6 text-xl font-semibold">최근 글</h2>{posts.length > 0 ? <div>{posts.map((post) => <PostCard key={post.id} post={post} />)}</div> : <p className="rounded-lg border border-dashed border-slate-300 px-6 py-12 text-center text-slate-500 dark:border-slate-700">아직 공개된 글이 없습니다.</p>}</section></SiteShell>;
}
