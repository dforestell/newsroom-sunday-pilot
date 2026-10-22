import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { HomeFeatured } from "../components/home-sections.tsx";
import type { Call } from "../lib/calls.ts";
import { metadata as homeMetadata } from "../app/page.tsx";

const source = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("homepage and header no longer feature the NFL scoreboard or game archives", () => {
  const home = source("app/page.tsx");
  assert.equal(/LiveScoreboard|scoreboard/i.test(home), false);
  assert.equal(/HomeArchive|\/games\//.test(home), false);
  const nav = source("components/site-nav.tsx");
  for (const href of ["/scores", "/games", "/archive"]) assert.equal(nav.includes(`href: "${href}`), false, href);
  assert.ok(nav.indexOf('href: "/stories"') < nav.indexOf('href: "/calls"'), "stories, then calls, lead the nav");
  assert.ok(nav.indexOf('href: "/calls"') < nav.indexOf('href: "/staff"'));
  assert.equal(/label: "Board"/.test(nav), false);
});

test("homepage puts the latest story and Chip's call first, then stories, then cast", () => {
  const home = source("app/page.tsx");
  const order = ["<HomeFeatured", "<HomeStories", "<HomeCast"].map((tag) => home.indexOf(tag));
  assert.ok(order.every((index) => index > 0));
  assert.deepEqual([...order].sort((a, b) => a - b), order);
});

test("homepage title and metadata are sport-neutral", () => {
  assert.deepEqual(homeMetadata.title, { absolute: "Poor Form Sports" });
  const text = JSON.stringify(homeMetadata) + source("app/layout.tsx");
  for (const pattern of [/NFL board/i, /NFL scores/i, /football/i, /Sunday/i]) {
    assert.equal(pattern.test(text), false, String(pattern));
  }
});

test("site-wide chrome and shared copy drop football-only wording", () => {
  const files = [
    "app/page.tsx",
    "app/layout.tsx",
    "app/not-found.tsx",
    "app/about/page.tsx",
    "components/site-chrome.tsx",
    "components/brand-lockup.tsx",
    "components/site-nav.tsx",
    "components/home-sections.tsx",
    "components/calls-list.tsx",
    "components/publishing-rhythm.tsx",
  ];
  for (const file of files) {
    const text = source(file);
    for (const pattern of [/NFL board/i, /\bfootball\b/i, /\bSunday\b/, /scoreboard/i, /kickoff/i, /\bDillon\b/, /\bGitHub\b/i, /\bCursor\b/, /vercel\.app/]) {
      assert.equal(pattern.test(text), false, `${file} has ${pattern}`);
    }
  }
});

test("the homepage call carries its sport label", () => {
  const call = (sport: Call["sport"], game: string): Call => ({
    date: "2026-10-20",
    dateLabel: "Oct 20, 2026",
    sport,
    game,
    take: "A take.",
    kind: "forecast",
    postUrl: "https://x.com/ChipAbsolute/status/1",
    status: "pending",
  });
  const nba = renderToStaticMarkup(createElement(HomeFeatured, { story: undefined, calls: [call("NBA", "BOS at NYK")] }));
  assert.match(nba, /Sport: <\/span>NBA/);
  assert.match(nba, /BOS at NYK/);
  const nfl = renderToStaticMarkup(createElement(HomeFeatured, { story: undefined, calls: [call("NFL", "WSH at SF")] }));
  assert.match(nfl, /Sport: <\/span>NFL/);
});
