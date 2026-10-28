import { array, fetchJson, object } from "./providers/common.ts";
import type { Fetcher } from "./providers/common.ts";
import { normalizeEspn } from "./providers/espn.ts";
import type { NflGame } from "./types.ts";

/** YYYY-MM-DD -> YYYYMMDD for the call date and the days either side (Sunday call, Monday game). */
export function espnDatesAround(date: string): string[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  const base = Date.parse(`${date}T12:00:00Z`);
  if (!Number.isFinite(base)) return [];
  return [0, 1, -1].map(offset => new Date(base + offset * 86_400_000).toISOString().slice(0, 10).replaceAll("-", ""));
}

/**
 * Final score for a past NFL game that has a Chip piece or call, straight from ESPN's dated
 * scoreboard. Returns null (never a guess) when ESPN has no final for that id or the fetch fails.
 */
export async function fetchPastFinal(gameId: string, date: string, fetcher: Fetcher = fetch): Promise<NflGame | null> {
  for (const day of espnDatesAround(date)) {
    try {
      const url = new URL("https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard");
      url.searchParams.set("limit", "100");
      url.searchParams.set("dates", day);
      const data = object(await fetchJson(url, {}, fetcher));
      if (array(data.events).length === 0) continue;
      const game = normalizeEspn(data, new Date().toISOString()).find(g => g.id === gameId);
      if (game) return game.state === "final" && game.home.score !== null && game.away.score !== null ? game : null;
    } catch {
      // Try the next day; the page falls back to the out-of-window message.
    }
  }
  return null;
}
