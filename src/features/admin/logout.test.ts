import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { QueryClient } from "@tanstack/react-query";
import { clearAdminQueryCache } from "@/features/admin/logout";

describe("admin logout cache clearing", () => {
  it("clears all TanStack Query data before redirecting", () => {
    const client = new QueryClient();
    client.setQueryData(["admin", "posts"], { posts: [{ id: "draft" }] });
    client.setQueryData(["public", "posts"], { posts: [] });

    clearAdminQueryCache(client);

    assert.equal(client.getQueryCache().getAll().length, 0);
  });
});