import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PostForm } from "@/components/admin/post-form";
import { adminPageRedirect } from "@/lib/auth";
import { AdminLogoutButton } from "@/components/admin/logout-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewPostPage() {
  const requestHeaders = await headers();
  if (adminPageRedirect(new Request("https://blog.malrang.net/admin/posts/new", { headers: requestHeaders }))) redirect("/admin/login");
  return <main className="mx-auto max-w-4xl p-8"><div className="mb-6 flex items-center justify-between"><h1 className="text-2xl font-semibold">새 게시글</h1><AdminLogoutButton /></div><PostForm /></main>;
}
