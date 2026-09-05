import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { Markdown } from "@/components/posts/markdown";

test("markdown renders GFM and does not render raw HTML", () => {
  const html = renderToStaticMarkup(createElement(Markdown, { content: "- [x] done\n\n<script>alert('xss')</script>\n\n~~old~~" }));
  assert.match(html, /type="checkbox"/);
  assert.match(html, /<del>old<\/del>/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});
