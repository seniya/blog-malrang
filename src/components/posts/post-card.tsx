import Link from "next/link";

import type { Post } from "@/db/schema";
import type { Category, Tag } from "@/db/schema";

export function PostCard({ post, taxonomy }: Readonly<{ post: Post; taxonomy?: { categories: Pick<Category, "id" | "name" | "slug">[]; tags: Pick<Tag, "id" | "name" | "slug">[] } }>) {
  return (
    <article className="group border-b border-slate-200 py-7 first:pt-0 dark:border-slate-800">
      <Link href={`/posts/${post.slug}`} className="block">
        <p className="mb-2 text-sm text-slate-500">{post.publishedAt ? formatDate(post.publishedAt) : ""}</p>
        <h2 className="text-2xl font-semibold tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400">{post.title}</h2>
        {post.excerpt && <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{post.excerpt}</p>}
        {taxonomy && <p className="mt-3 text-sm text-slate-500">{taxonomy.categories.map((item) => item.name).join(" · ")} {taxonomy.tags.map((item) => `#${item.name}`).join(" ")}</p>}
      </Link>
    </article>
  );
}

export function formatDate(date: Date | null) {
  return date?.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Seoul" }) ?? "";
}
