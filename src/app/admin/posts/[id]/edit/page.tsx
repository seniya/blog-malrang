import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db/client";
import { PostForm } from "@/components/admin/post-form";
import { getPostById, getPostTaxonomy } from "@/features/posts/repository";
import { adminPageRedirect } from "@/lib/auth";
import { AdminLogoutButton } from "@/components/admin/logout-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  const requestHeaders = await headers();
  if (adminPageRedirect(new Request("https://blog.malrang.net/admin/posts/edit", { headers: requestHeaders }))) redirect("/admin/login");
  const post = getPostById(db, (await params).id);
  if (!post) notFound();
  return <main className="mx-auto max-w-4xl p-8"><div className="mb-6 flex items-center justify-between"><h1 className="text-2xl font-semibold">게시글 수정</h1><AdminLogoutButton /></div><PostForm post={{ ...post, ...getPostTaxonomy(db, post.id) }} /></main>;
}
