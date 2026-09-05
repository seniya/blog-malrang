"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: form.get("username"), password: form.get("password") }) });
    setBusy(false);
    if (!response.ok) { setError("아이디 또는 비밀번호가 올바르지 않습니다."); return; }
    router.push("/admin"); router.refresh();
  }
  return <main className="mx-auto max-w-md p-8"><h1 className="text-2xl font-semibold">관리자 로그인</h1><form className="mt-6 space-y-4" onSubmit={submit}><label className="block">아이디<input name="username" required autoComplete="username" className="mt-1 w-full rounded border p-2" /></label><label className="block">비밀번호<input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full rounded border p-2" /></label>{error && <p role="alert" className="text-red-600">{error}</p>}<button disabled={busy} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">로그인</button></form></main>;
}
