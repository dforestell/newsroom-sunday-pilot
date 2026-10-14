import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("cast list uses divider rows on mobile and keeps cards from sm up", () => {
  const page = source("app/cast/page.tsx");
  assert.match(page, /divide-y divide-border/);
  assert.match(page, /sm:border sm:border-border sm:bg-card/);
});

test("story tables keep only top/bottom rules and row dividers on mobile", () => {
  const css = source("app/globals.css");
  const mobile = css.slice(css.indexOf("@media (max-width: 639.98px)"));
  assert.match(mobile, /\.story-table \{ border-left: 0; border-right: 0;/);
  assert.match(mobile, /\.story-table thead \{ background: transparent; \}/);
});
