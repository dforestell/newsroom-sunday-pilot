import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { HALL_RESEARCH } from "../lib/hall/research.ts";
import { HOU_SAS_GAME, HOU_SAS_HOOKS } from "../lib/nba/hou-sas-2026-10-23.ts";
import { loadCalls } from "../lib/calls/files.ts";
import { loadStories } from "../lib/stories/files.ts";

const source = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const BANNED = [/\bDillon\b/i, /\bDEMO\b/, /\bGitHub\b/i, /\bCursor\b/, /vercel\.app/i, /\bprocess\b/i];

test("ticker reads the same calls data and record function as /calls, links via SITE_URL", () => {
  const ticker = source("components/chip-ticker.tsx");
  assert.match(ticker, /listPublicCalls\(\)/);
  assert.match(ticker, /getCallRecord\(/);
  assert.match(ticker, /\$\{SITE_URL\}\/calls/);
  assert.match(ticker, /PERSONA_THEMES\["chip-absolute"\]/);
  assert.doesNotMatch(ticker, /\b(NFL|NBA)\b/);
  assert.match(source("app/calls/page.tsx"), /listPublicCalls\(\)/);
  assert.match(source("components/site-chrome.tsx"), /<ChipTicker \/>/);
});

test("hall entries each carry an https source and clean copy", () => {
  assert.ok(HALL_RESEARCH.length >= 1);
  for (const entry of HALL_RESEARCH) {
    assert.ok(entry.sources.length >= 1, entry.id);
    for (const s of entry.sources) assert.match(s.url, /^https:\/\//);
    for (const text of [entry.take, entry.credit, entry.verdict, entry.note ?? ""]) for (const re of BANNED) assert.doesNotMatch(text, re, `${entry.id}: ${text}`);
  }
  assert.match(source("components/site-chrome.tsx"), /href="\/hall-of-wrong"/);
});

test("NBA hooks are sourced and the game details match the Friday pack", () => {
  assert.ok(HOU_SAS_HOOKS.length >= 2 && HOU_SAS_HOOKS.length <= 3);
  for (const hook of HOU_SAS_HOOKS) assert.match(hook.source.url, /^https:\/\//);
  assert.equal(HOU_SAS_GAME.when, "Fri Oct 23 · 8:30 PM CT");
  assert.equal(HOU_SAS_GAME.tv, "Prime Video");
});

test("hub links are in the nav and every filed story has a sport", () => {
  const nav = source("components/site-nav.tsx");
  assert.ok(nav.includes('href: "/nfl"') && nav.includes('href: "/nba"'));
  for (const story of loadStories()) assert.equal(story.sport, "NFL", story.slug);
  for (const call of loadCalls().filter((c) => c.sport === "NBA")) {
    assert.match(call.postUrl, /^https:\/\/x\.com\/ChipAbsolute\/status\/\d+$/, "NBA calls need a real Chip post");
  }
});
