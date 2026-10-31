import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { HALL_RESEARCH } from "../lib/hall/research.ts";
import { loadCalls } from "../lib/calls/files.ts";
import { loadStories } from "../lib/stories/files.ts";

const source = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const BANNED = [/\bDillon\b/i, /\bDEMO\b/, /\bGitHub\b/i, /\bCursor\b/, /vercel\.app/i, /\bprocess\b/i];

test("ticker reads the same calls data and record function as /calls, links via SITE_URL", () => {
  const ticker = source("components/chip-ticker.tsx");
  assert.match(ticker, /listPublicCalls\(\)/);
  assert.match(ticker, /getCallRecord\(/);
  assert.match(ticker, /\$\{SITE_URL\}\/calls/);
  assert.match(ticker, /bg-bar text-bar-foreground/);
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

test("NBA hub no longer advertises the finished Oct 23 game", () => {
  const nba = source("app/nba/page.tsx");
  assert.equal(/HOU_SAS|hou-sas-2026-10-23|Game hooks/.test(nba), false);
});

test("hub links are in the nav; tagged stories are NFL or NBA (untagged = All only)", () => {
  const nav = source("components/site-nav.tsx");
  assert.ok(nav.includes('href: "/nfl"') && nav.includes('href: "/nba"'));
  // sport is optional on stories (docs + schema); CFB/desk filings stay untagged until a /cfb hub exists.
  for (const story of loadStories()) {
    if (story.sport) assert.ok(story.sport === "NFL" || story.sport === "NBA", story.slug);
  }
  for (const call of loadCalls().filter((c) => c.sport === "NBA")) {
    assert.match(call.postUrl, /^https:\/\/x\.com\/ChipAbsolute\/status\/\d+$/, "NBA calls need a real Chip post");
  }
});
