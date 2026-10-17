import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("game detail 'All games' link goes to /scores", () => {
  assert.match(source("components/scoreboard/live-scoreboard.tsx"), /href="\/scores"[^>]*>← All games/);
});

test("desktop nav switches at lg; menu toggle stays through tablet", () => {
  const nav = source("components/site-nav.tsx");
  assert.match(nav, /hidden [^"]*lg:flex/);
  assert.doesNotMatch(nav, /sm:hidden|sm:flex/);
});

test("Escape closes the mobile menu and refocuses the toggle", () => {
  const nav = source("components/site-nav.tsx");
  assert.match(nav, /"Escape"/);
  assert.match(nav, /toggleRef\.current\?\.focus\(\)/);
});

test("mobile header stays h-14 with a larger wordmark", () => {
  assert.match(source("components/site-chrome.tsx"), /h-14 [^"]*lg:h-auto/);
  assert.match(source("components/brand-lockup.tsx"), /h-7 w-auto sm:h-9/);
});

test("red section links and kickers are at least text-sm", () => {
  const home = source("components/home-sections.tsx");
  assert.match(home, /const kicker = "font-mono text-sm /);
  assert.doesNotMatch(home, /text-\[11px\][^"]*text-masthead/);
});
