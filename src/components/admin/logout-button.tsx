"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { clearAdminQueryCache } from "@/features/admin/logout";

export function AdminLogoutButton() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [error, setError] = useState(false);

  async function logout() {
    setError(false);
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (!response.ok) {
      setError(true);
      return;
    }
    clearAdminQueryCache(queryClient);
    router.replace("/admin/login");
    router.refresh();
  }

  return <span className="inline-flex items-center gap-2">{error && <span role="alert" className="text-sm text-red-600">로그아웃에 실패했습니다.</span>}<button type="button" onClick={() => void logout()} className="rounded border px-3 py-1">로그아웃</button></span>;
}