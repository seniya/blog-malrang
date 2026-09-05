"use client";
import Link from "next/link";
import { useState } from "react";
import { useAdminTaxonomy, useCreateTaxonomy } from "@/features/posts/admin-hooks";
export default function TaxonomyPage() {
  const query = useAdminTaxonomy(); const create = useCreateTaxonomy(); const [name, setName] = useState(""); const [type, setType] = useState<"category" | "tag">("tag");
  async function submit(event: React.FormEvent) { event.preventDefault(); if (!name.trim()) return; await create.mutateAsync({ type, data: { name: name.trim() } }); setName(""); }
  return <main className="mx-auto max-w-4xl p-8"><div className="mb-8 flex justify-between"><h1 className="text-2xl font-semibold">카테고리 · 태그 관리</h1><Link href="/admin/posts" className="underline">게시글로 돌아가기</Link></div><form onSubmit={submit} className="mb-8 flex gap-2"><select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="rounded border p-2"><option value="category">카테고리</option><option value="tag">태그</option></select><input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" className="rounded border p-2"/><button className="rounded bg-black px-4 py-2 text-white">추가</button></form><div className="grid gap-8 md:grid-cols-2"><section><h2 className="mb-3 font-semibold">카테고리</h2><ul className="space-y-2">{query.data?.categories.map((item) => <li key={item.id} className="rounded border p-3">{item.name} <span className="text-sm text-slate-500">/{item.slug}</span></li>)}</ul></section><section><h2 className="mb-3 font-semibold">태그</h2><ul className="space-y-2">{query.data?.tags.map((item) => <li key={item.id} className="rounded border p-3">#{item.name} <span className="text-sm text-slate-500">/{item.slug}</span></li>)}</ul></section></div></main>;
}
