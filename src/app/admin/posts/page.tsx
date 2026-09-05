"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdminPosts, useDeletePost } from "@/features/posts/admin-hooks";
import { AdminLogoutButton } from "@/components/admin/logout-button";

export default function AdminPostsPage() {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const query = useAdminPosts({ status, search });
  const remove = useDeletePost();
  async function handleDelete(id: string) {
    if (!window.confirm("이 게시글을 삭제할까요?")) return;
    try {
      await remove.mutateAsync(id);
    } catch {
      // The mutation error is rendered below for keyboard and screen-reader users.
    }
  }
  return <main className="mx-auto max-w-5xl p-8">
    <div className="flex items-center justify-between gap-4"><h1 className="text-2xl font-semibold">게시글 관리</h1><div className="flex items-center gap-3"><AdminLogoutButton /><Link href="/admin/posts/new" className="rounded bg-black px-4 py-2 text-white">새 글</Link></div></div>
    <div className="my-6 flex flex-wrap gap-3"><input aria-label="게시글 검색" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="제목 또는 슬러그 검색" className="rounded border p-2" /><select aria-label="상태 필터" value={status} onChange={(event) => setStatus(event.target.value)} className="rounded border p-2"><option value="all">전체</option><option value="draft">임시 저장</option><option value="published">공개</option></select></div>
    {query.isLoading && <p>불러오는 중…</p>}
    {query.isError && <p role="alert" className="text-red-600">{query.error.message}</p>}
    {!query.isLoading && !query.isError && query.data?.posts.length === 0 && <p>게시글이 없습니다.</p>}
    {remove.isError && <p role="alert" className="mb-4 text-red-600">{remove.error.message}</p>}
    <ul className="space-y-3">{query.data?.posts.map((post) => <li key={post.id} className="flex items-center justify-between rounded border p-4"><div><Link className="font-medium underline" href={`/admin/posts/${post.id}/edit`}>{post.title}</Link><p className="text-sm text-slate-500">/{post.slug} · {post.status === "draft" ? "임시 저장" : "공개"}</p></div><button disabled={remove.isPending} onClick={() => void handleDelete(post.id)} className="rounded border border-red-600 px-3 py-1 text-red-600">삭제</button></li>)}</ul>
  </main>;
}
