import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { loadCalls } from "../lib/calls/files.ts";
import { GAME_PIECES, findGameCall, getGamePiece, parseGameId } from "../lib/games/pieces.ts";
import { getVoice } from "../lib/cast.ts";

const BANNED = [/\bDillon\b/i, /\bDEMO\b/, /\bGitHub\b/i, /\bCursor\b/, /satire/i, /vercel\.app/i];

test("parses NFL and NBA game ids", () => {
  assert.deepEqual(parseGameId("nfl:2026:2:NE:CHI"), { sport: "NFL", season: 2026, away: "NE", home: "CHI" });
  assert.equal(parseGameId("nba:2026:2:HOU:SAS")?.sport, "NBA");
  assert.equal(parseGameId("mlb:2026:2:NE:CHI"), null);
  assert.equal(parseGameId("nfl:2026:2:ne:chi"), null);
});

test("NE@CHI piece is placeholder, defaults to Chip, matches the Maye call", () => {
  const piece = getGamePiece("nfl:2026:2:NE:CHI");
  assert.equal(piece?.headline, "Chip on New England at Chicago");
  assert.equal(piece?.author, "chip-absolute");
  assert.deepEqual(piece?.body, ["Chip’s piece drops before kickoff."]);
  const call = findGameCall("nfl:2026:2:NE:CHI", loadCalls());
  assert.equal(call?.take, "Chicago sacks Drake Maye at least 3 times.");
});

test("nora-median byline resolves; missing game has no piece", () => {
  const piece = getGamePiece("nba:2026:2:HOU:SAS", { "nba:2026:2:HOU:SAS": { headline: "H", body: ["B"], author: "nora-median" } });
  assert.equal(piece?.author, "nora-median");
  assert.ok(getVoice("nora-median"));
  assert.equal(getGamePiece("nfl:2026:2:KC:LV"), null);
  assert.equal(findGameCall("nfl:2026:2:KC:LV", loadCalls()), null);
});

test("calls match by sport, matchup and season", () => {
  const calls = loadCalls();
  assert.equal(findGameCall("nba:2026:2:NE:CHI", calls), null);
  assert.equal(findGameCall("nfl:2020:2:NE:CHI", calls), null);
  assert.equal(findGameCall("nfl:2026:2:MIN:CHI", calls)?.date, "2026-09-20");
});

test("piece copy is clean and the lead links to /calls", () => {
  for (const [id, p] of Object.entries(GAME_PIECES)) {
    assert.ok(parseGameId(id), id);
    for (const text of [p.headline, ...p.body]) for (const re of BANNED) assert.doesNotMatch(text, re, text);
  }
  const lead = readFileSync(new URL("../components/game-piece.tsx", import.meta.url), "utf8");
  assert.match(lead, /href="\/calls"/);
  assert.match(lead, /<StaffLink/);
  assert.doesNotMatch(lead, /SatireLabel|satire/i);
});

test("game page renders score details before the staff piece", () => {
  const page = readFileSync(new URL("../app/scores/[id]/page.tsx", import.meta.url), "utf8");
  assert.ok(page.indexOf("<LiveScoreboard") < page.indexOf("<GamePieceLead"));
});

test("piece body links: only poorformsports.com or relative, else plain text", async () => {
  const { parseBodyLinks, safePieceHref } = await import("../lib/games/pieces.ts");
  assert.deepEqual(parseBodyLinks("See [Chip's calls](https://poorformsports.com/calls) now"), [
    { text: "See " }, { text: "Chip's calls", href: "/calls" }, { text: " now" },
  ]);
  assert.deepEqual(parseBodyLinks("[x](https://evil.com/calls)"), [{ text: "x" }]);
  assert.equal(safePieceHref("//evil.com"), null);
  assert.equal(safePieceHref("javascript:alert(1)"), null);
  assert.equal(safePieceHref("https://poorformsports.com.evil.com/x"), null);
  assert.equal(safePieceHref("/stories/x"), "/stories/x");
  for (const p of Object.values(GAME_PIECES)) for (const para of p.body) {
    for (const m of para.matchAll(/\]\(([^)]+)\)/g)) assert.ok(safePieceHref(m[1]), m[1]);
  }
});

test("HOU at SAS NBA call matches the NBA game page id", () => {
  const call = findGameCall("nba:2026:2:HOU:SAS", loadCalls());
  assert.equal(call?.sport, "NBA");
  assert.equal(call?.status, "pending");
});
