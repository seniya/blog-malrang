import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { GET, POST } from "@/app/api/admin/posts/route";

describe("admin post API authorization boundary", () => {
  it("returns JSON 401 for unauthenticated list and create requests", async () => {
    const list = await GET(new Request("https://blog.malrang.net/api/admin/posts"));
    assert.equal(list.status, 401);
    assert.deepEqual(await list.json(), { error: "Unauthorized" });

    const create = await POST(new Request("https://blog.malrang.net/api/admin/posts", { method: "POST", body: "{}" }));
    assert.equal(create.status, 401);
    assert.deepEqual(await create.json(), { error: "Unauthorized" });
  });
});
