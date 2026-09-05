import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { adminPageRedirect } from "@/lib/auth";

export default async function AdminPage() {
  const requestHeaders = await headers();
  const target = adminPageRedirect(new Request("https://blog.malrang.net/admin", { headers: requestHeaders }));
  if (target) redirect(target.pathname);
  return <main className="mx-auto max-w-3xl p-8"><h1 className="text-2xl font-semibold">Admin</h1><p className="mt-4">인증되었습니다.</p><a className="mt-6 inline-block underline" href="/admin/posts">게시글 관리</a></main>;
}
