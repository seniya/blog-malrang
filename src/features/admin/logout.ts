import type { QueryClient } from "@tanstack/react-query";

export function clearAdminQueryCache(queryClient: QueryClient): void {
  queryClient.clear();
}