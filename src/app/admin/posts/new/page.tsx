import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PostForm } from "@/components/admin/post-form";
import { adminPageRedirect } from "@/lib/auth";

export default async function NewPostPage() {
  const requestHeaders = await headers();
  if (adminPageRedirect(new Request("https://blog.malrang.net/admin/posts/new", { headers: requestHeaders }))) redirect("/admin/login");
  return <main className="mx-auto max-w-4xl p-8"><h1 className="mb-6 text-2xl font-semibold">새 게시글</h1><PostForm /></main>;
}
