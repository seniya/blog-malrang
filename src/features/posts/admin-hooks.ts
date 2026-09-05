"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Post } from "@/db/schema";

export const adminPostsKey = ["admin", "posts"] as const;

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  const body = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) throw new Error(body.error ?? "Request failed");
  return body;
}

export function useAdminPosts(filters: { status?: string; search?: string }) {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  return useQuery({ queryKey: [...adminPostsKey, filters], queryFn: () => requestJson<{ posts: Post[] }>(`/api/admin/posts?${params}`) });
}

export function useAdminPost(id: string) {
  return useQuery({ queryKey: [...adminPostsKey, id], queryFn: () => requestJson<{ post: Post }>(`/api/admin/posts/${id}`), enabled: Boolean(id) });
}

export function useCreatePost() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (input: Record<string, unknown>) => requestJson<{ post: Post }>("/api/admin/posts", { method: "POST", body: JSON.stringify(input) }), onSuccess: () => client.invalidateQueries({ queryKey: adminPostsKey }) });
}

export function useUpdatePost(id: string) {
  const client = useQueryClient();
  return useMutation({ mutationFn: (input: Record<string, unknown>) => requestJson<{ post: Post }>(`/api/admin/posts/${id}`, { method: "PATCH", body: JSON.stringify(input) }), onSuccess: () => { void client.invalidateQueries({ queryKey: adminPostsKey }); } });
}

export function useDeletePost() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (id: string) => requestJson<{ deleted: true }>(`/api/admin/posts/${id}`, { method: "DELETE" }), onSuccess: () => client.invalidateQueries({ queryKey: adminPostsKey }) });
}
