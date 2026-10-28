import assert from "node:assert/strict";
import test from "node:test";
import { espnDatesAround, fetchPastFinal } from "../../lib/nfl/past-final.ts";

const event = (state: string, away: string, home: string, as: string, hs: string) => ({
  id: "1", date: "2026-10-27T00:20Z", season: { year: 2026, type: 2 }, week: { number: 8 },
  competitions: [{ status: { type: { name: state, shortDetail: "Final" } }, competitors: [
    { homeAway: "home", score: hs, team: { abbreviation: home, shortDisplayName: home } },
    { homeAway: "away", score: as, team: { abbreviation: away, shortDisplayName: away } },
  ] }],
});
const fetcherFor = (body: unknown, seen: string[] = []) => (async (url: URL) => {
  seen.push(url.searchParams.get("dates") ?? "");
  return new Response(JSON.stringify(body), { status: 200 });
}) as unknown as typeof fetch;

test("dates around a call date", () => {
  assert.deepEqual(espnDatesAround("2026-10-26"), ["20261026", "20261027", "20261025"]);
  assert.deepEqual(espnDatesAround("bad"), []);
});

test("returns ESPN final for the matching game", async () => {
  const seen: string[] = [];
  const game = await fetchPastFinal("nfl:2026:2:DAL:PHI", "2026-10-26", fetcherFor({ events: [event("STATUS_FINAL", "DAL", "PHI", "38", "21")] }, seen));
  assert.equal(game?.state, "final");
  assert.equal(game?.away.score, 38);
  assert.equal(game?.home.score, 21);
  assert.deepEqual(seen, ["20261026"]);
});

test("never invents a final: non-final, missing, or failed fetch is null", async () => {
  assert.equal(await fetchPastFinal("nfl:2026:2:DAL:PHI", "2026-10-26", fetcherFor({ events: [event("STATUS_IN_PROGRESS", "DAL", "PHI", "7", "3")] })), null);
  assert.equal(await fetchPastFinal("nfl:2026:2:DAL:PHI", "2026-10-26", fetcherFor({ events: [] })), null);
  const failing = (async () => new Response("no", { status: 500 })) as unknown as typeof fetch;
  assert.equal(await fetchPastFinal("nfl:2026:2:DAL:PHI", "2026-10-26", failing), null);
});
