import { redirect } from "next/navigation";

import { adminPageRedirect } from "@/lib/auth";

export default function AdminPage() {
  const target = adminPageRedirect(new Request("https://blog.malrang.net/admin"));
  if (target) redirect(target.pathname);
  return <main className="mx-auto max-w-3xl p-8"><h1 className="text-2xl font-semibold">Admin</h1><p className="mt-4">인증되었습니다.</p></main>;
}
