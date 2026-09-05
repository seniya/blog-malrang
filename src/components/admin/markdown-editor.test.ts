import assert from "node:assert/strict";
import { test } from "node:test";

import { applyMarkdownAction } from "@/components/admin/markdown-editor";

test("bold action wraps the selected text and preserves the selection", () => {
  const result = applyMarkdownAction("hello world", { start: 6, end: 11 }, "bold");

  assert.deepEqual(result, { value: "hello **world**", start: 8, end: 13 });
});

test("link action inserts a markdown link template at the cursor", () => {
  const result = applyMarkdownAction("Read ", { start: 5, end: 5 }, "link");

  assert.deepEqual(result, { value: "Read [텍스트](https://)", start: 6, end: 9 });
});

test("list action prefixes every selected line", () => {
  const result = applyMarkdownAction("first\nsecond", { start: 0, end: 12 }, "bulletList");

  assert.deepEqual(result, { value: "- first\n- second", start: 0, end: 16 });
});
