import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CallsList } from "../components/calls-list.tsx";
import { getCallRecord, sportRecords, type Call } from "../lib/calls.ts";
import { parseCall } from "../lib/calls/content.ts";
import { DEFAULT_SPORT, SPORTS, isSport } from "../lib/calls/sports.ts";
import { FILE_CALLS } from "../lib/generated/content.ts";

const base = {
  date: "2026-10-20",
  sport: "NFL",
  game: "DET at TB",
  take: "A take.",
  kind: "forecast",
  postUrl: "https://x.com/ChipAbsolute/status/20",
  status: "pending",
};

const parse = (fields: Record<string, unknown>, name = "2026-10-20-test.json") =>
  parseCall(name, `${JSON.stringify(fields)}\n`);

function call(overrides: Partial<Call> & Pick<Call, "date" | "status" | "postUrl">): Call {
  return {
    sport: "NFL",
    game: "DET at TB",
    take: "A take.",
    kind: "forecast",
    result: "A result.",
    dateLabel: overrides.date,
    ...overrides,
  };
}

test("sports come from one list, and NFL is the read default", () => {
  assert.deepEqual([...SPORTS], ["NFL", "NBA"]);
  assert.equal(DEFAULT_SPORT, "NFL");
  assert.ok(isSport("NBA"));
  assert.equal(isSport("nba"), false);
  assert.equal(isSport(undefined), false);
});

test("sport is required and must be on the list", () => {
  const missing = Object.fromEntries(Object.entries(base).filter(([key]) => key !== "sport"));
  assert.throws(() => parse(missing), /sport: Use sport "NFL" or "NBA"/);
  assert.throws(() => parse({ ...base, sport: "MLB" }), /sport: Use sport "NFL" or "NBA"/);
  assert.throws(() => parse({ ...base, sport: "nfl" }), /sport: Use sport "NFL" or "NBA"/);
  assert.equal(parse(base).sport, "NFL");
});

test("NBA calls accept NBA game strings and free-text windows", () => {
  const nba = parse({ ...base, sport: "NBA", game: "BOS at NYK", window: "NBA Cup" });
  assert.equal(nba.sport, "NBA");
  assert.equal(nba.game, "BOS at NYK");
  assert.equal(nba.window, "NBA Cup");
  assert.equal(parse({ ...base, sport: "NBA", game: "LAL at GSW", window: "Christmas Day" }).window, "Christmas Day");
});

test("receiptUrl is optional, validated like postUrl, and only on graded calls", () => {
  const graded = { ...base, status: "missed", result: "Detroit won." };
  assert.equal(parse(graded).receiptUrl, undefined);
  assert.equal(parse({ ...graded, receiptUrl: "https://x.com/ChipAbsolute/status/21" }).receiptUrl, "https://x.com/ChipAbsolute/status/21");
  for (const bad of ["https://twitter.com/ChipAbsolute/status/21", "https://x.com/Other/status/21", "https://x.com/ChipAbsolute/status/21?s=20"]) {
    assert.throws(() => parse({ ...graded, receiptUrl: bad }), /receiptUrl: Use an https:\/\/x\.com\/ChipAbsolute\/status\/<id> URL/);
  }
  assert.throws(() => parse({ ...base, receiptUrl: "https://x.com/ChipAbsolute/status/21" }), /receiptUrl: A pending call has no receipt yet/);
  assert.throws(() => parse({ ...graded, receiptUrl: base.postUrl }), /receiptUrl: The receipt is Chip's follow-up post/);
});

test("every filed call is tagged with a listed sport, and the Nix and Lloyd receipts are backfilled", () => {
  const directory = join(process.cwd(), "content/calls");
  for (const name of readdirSync(directory).filter((file) => file.endsWith(".json"))) {
    const raw = JSON.parse(readFileSync(join(directory, name), "utf8"));
    assert.equal(raw.sport, "NFL", `${name} is tagged NFL`);
  }
  const receipt = (name: string) => FILE_CALLS.find((filed) => filed.take.includes(name))?.receiptUrl;
  assert.equal(receipt("Nix"), "https://x.com/ChipAbsolute/status/2111099294501445833");
  assert.equal(receipt("Lloyd"), "https://x.com/ChipAbsolute/status/2112187249110437954");
  assert.equal(receipt("McCaffrey"), "https://x.com/ChipAbsolute/status/2112548066654101706");
});

test("per-sport records list only sports with calls, in list order, and skip ungraded calls", () => {
  const calls = [
    call({ date: "2026-10-05", status: "held-up", postUrl: "https://x.com/ChipAbsolute/status/1" }),
    call({ date: "2026-10-06", status: "missed", postUrl: "https://x.com/ChipAbsolute/status/2" }),
    call({ date: "2026-10-07", status: "ungraded", postUrl: "https://x.com/ChipAbsolute/status/3" }),
  ];
  assert.deepEqual(sportRecords(calls), [{ sport: "NFL", calls: 3, hits: 1, misses: 1 }]);
  const withNba = [...calls, call({ sport: "NBA", date: "2026-10-22", status: "pending", game: "BOS at NYK", postUrl: "https://x.com/ChipAbsolute/status/4", result: undefined })];
  assert.deepEqual(sportRecords(withNba), [
    { sport: "NFL", calls: 3, hits: 1, misses: 1 },
    { sport: "NBA", calls: 1, hits: 0, misses: 0 },
  ]);
  assert.deepEqual(sportRecords([]), []);
});

test("/calls keeps the overall record as the headline, adds per-sport records, chips and receipt links", () => {
  const nfl = call({ date: "2026-10-15", status: "missed", postUrl: "https://x.com/ChipAbsolute/status/15", take: "Nix throws a pick.", receiptUrl: "https://x.com/ChipAbsolute/status/16" });
  const pendingWithReceipt = { ...call({ date: "2026-10-19", status: "pending", postUrl: "https://x.com/ChipAbsolute/status/19", take: "Pending take.", result: undefined }), receiptUrl: "https://x.com/ChipAbsolute/status/191" };
  const nba = call({ sport: "NBA", date: "2026-10-21", status: "held-up", game: "BOS at NYK", window: "NBA Cup", postUrl: "https://x.com/ChipAbsolute/status/21", take: "Brunson scores 30." });
  const calls = [nfl, pendingWithReceipt, nba];

  const html = renderToStaticMarkup(createElement(CallsList, { calls }));
  const overall = getCallRecord(calls);
  assert.equal(overall.tally.hits, 1);
  assert.equal(overall.tally.misses, 1);
  assert.match(html, /Record <span>1<\/span>–<span>1<\/span>/);
  assert.match(html, /data-sport-records[^>]*>[\s\S]*?NFL 0–1[\s\S]*?NBA 1–0/);
  assert.ok(html.indexOf("Record <span>") < html.indexOf("data-sport-records"), "overall record stays first");
  assert.match(html, /BOS at NYK/);
  assert.match(html, /NBA Cup/);
  assert.match(html, /Sport: <\/span>NBA/);
  assert.match(html, /href="https:\/\/x\.com\/ChipAbsolute\/status\/16"[^>]*>Receipt</);
  assert.equal(html.includes("status/191"), false, "pending rows never show a receipt");

  const nflOnly = renderToStaticMarkup(createElement(CallsList, { calls: [nfl] }));
  assert.match(nflOnly, /data-sport-records[^>]*>[\s\S]*?NFL 0–1/);
  assert.equal(/NBA \d/.test(nflOnly), false, "NBA stays hidden until an NBA call exists");
});
