import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(relativePath: string) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("finished demo archives keep filed-timeline chrome on all six routes", () => {
  const view = source("components/game-view.tsx");
  const delayed = source("app/games/[id]/delayed/page.tsx");
  const gamePage = source("app/games/[id]/page.tsx");
  const catalog = source("lib/live/catalog.ts");

  assert.match(view, /Filed timeline/);
  assert.match(view, /Voices in this archive/);
  assert.match(
    view,
    /This game is final\. Read the filed timeline below; this page is not a live feed\./,
  );
  assert.equal(/Public live feed/i.test(view), false);
  assert.equal(/Who should talk\?/i.test(view), false);
  assert.equal(/Updates delayed/i.test(view), false);
  assert.equal(/\bListening\b/.test(view), false);

  const demoBranch = view.slice(view.indexOf("if (game.demo)"), view.lastIndexOf("return ("));
  assert.equal(/PublicFeedControls/.test(demoBranch), false);
  assert.equal(/Pause feed/.test(demoBranch), false);
  assert.equal(/Resume feed/.test(demoBranch), false);

  assert.match(gamePage, /<GameView id={id} paused={false} \/>/);
  assert.match(delayed, /<GameView id={id} paused \/>/);
  assert.match(delayed, /\$\{game\.name\} · Archive/);
  assert.match(delayed, /if \(game\.demo\)/);

  assert.match(catalog, /id: "sunday-pilot"/);
  assert.match(catalog, /id: "demo-dal-nyg-snf"/);
  assert.match(catalog, /id: "demo-den-kc-mnf"/);
});

test("public surfaces drop Desk review invitations and Editor-lands-copy crumb", () => {
  const nav = source("components/site-nav.tsx");
  const home = source("app/page.tsx");
  const stories = source("app/stories/page.tsx");
  const review = source("app/review/page.tsx");
  const gate = source("app/review/gate-form.tsx");

  assert.equal(/Desk review/.test(nav), false);
  assert.equal(/href: "\/review"/.test(nav), false);
  assert.equal(/Desk review/.test(home), false);
  assert.equal(/Unlock review/.test(home), false);
  assert.equal(/Private desk tape/.test(home), false);
  assert.equal(/More stories when Editor lands copy\./.test(stories), false);

  assert.match(review, /title: "Desk review"/);
  assert.match(review, /isReviewUnlocked/);
  assert.match(gate, /Unlock review/);
});

test("demo source strips keep attribution and drop production crumbs", () => {
  const banners = source("lib/demo/banners.ts");
  const catalog = source("lib/live/catalog.ts");

  assert.match(banners, /Sources: ESPN recap gameId 401872657, Reuters, Rams.com, NFL gamebook/);
  assert.match(banners, /Sources: ESPN recap gameId 401872930, CBS, NBC, Giants.com/);
  assert.match(banners, /Sources: ESPN recap gameId 401872931/);
  assert.equal(/Injury beats skipped/i.test(banners), false);
  assert.equal(/Carl silent/i.test(banners), false);
  assert.equal(/digest only/i.test(banners), false);
  assert.equal(/Injury beats skipped/i.test(catalog), false);
  assert.equal(/Carl silent/i.test(catalog), false);
});

test("real live scoreboard delay copy stays on the live path", () => {
  const presentation = source("lib/nfl/presentation.ts");
  assert.match(presentation, /Updates delayed/);
  assert.match(source("components/scoreboard/live-scoreboard.tsx"), /export function LiveScoreboard/);
});

test("archive index lists filed games but stays out of the nav", () => {
  const page = source("app/archive/page.tsx");
  const nav = source("components/site-nav.tsx");
  assert.match(page, /listPublicGames\(\)\.filter\(\(game\) => game\.demo\)/);
  assert.match(page, /await listPublicStories\(\)/);
  assert.match(page, /never live scores/);
  assert.equal(/href: "\/archive"/.test(nav), false);
  assert.equal(/\/games\/sunday-pilot/.test(nav), false);
});

test("Melbourne and DAL @ NYG archives link their sources", () => {
  const banners = source("lib/demo/banners.ts");
  assert.match(banners, /https:\/\/www\.espn\.com\/nfl\/recap\?gameId=401872657/);
  assert.match(banners, /https:\/\/www\.nfl\.com\/games\/49ers-at-rams-2026-reg-1/);
  assert.match(banners, /https:\/\/www\.espn\.com\/nfl\/recap\?gameId=401872930/);
  assert.match(banners, /https:\/\/www\.nfl\.com\/games\/cowboys-at-giants-2026-reg-1/);
});
