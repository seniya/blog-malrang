import assert from "node:assert/strict";
import { test } from "node:test";

import { escapeXml } from "@/app/rss.xml/route";

test("RSS XML escaping covers text and URL-sensitive characters", () => {
  assert.equal(escapeXml(`https://example.test/a?x=1&y=\"<tag>\"`), "https://example.test/a?x=1&amp;y=&quot;&lt;tag&gt;&quot;");
});
