// Per-game staff pieces that lead /scores/<gameId>. Sport-neutral: game ids are
// "<sport>:<season>:<seasonType>:<AWAY>:<HOME>", e.g. "nfl:2026:2:NE:CHI" or "nba:2026:2:HOU:SAS".
// Add a piece by adding an entry to GAME_PIECES. `author` defaults to chip-absolute.
// Never file invented facts: until the real piece is written, keep placeholder copy.
import type { Call } from "../calls/content.ts";

export type GamePieceAuthor = "chip-absolute" | "nora-median";

export type GamePieceInput = {
  headline: string;
  /** Short body, one paragraph per entry. */
  body: string[];
  author?: GamePieceAuthor;
};

export type GamePiece = Required<GamePieceInput>;

export const DEFAULT_PIECE_AUTHOR: GamePieceAuthor = "chip-absolute";

export const GAME_PIECES: Record<string, GamePieceInput> = {
  "nfl:2026:2:NE:CHI": {
    headline: "Chip on New England at Chicago",
    body: ["Chip’s piece drops before kickoff."],
  },
};

export type ParsedGameId = { sport: string; season: number; away: string; home: string };

const GAME_ID = /^(nfl|nba):(\d{4}):([1-5]):([A-Z]{2,4}):([A-Z]{2,4})$/;

export function parseGameId(id: string): ParsedGameId | null {
  const m = GAME_ID.exec(id);
  if (!m) return null;
  return { sport: m[1].toUpperCase(), season: Number(m[2]), away: m[4], home: m[5] };
}

export function getGamePiece(id: string, pieces: Record<string, GamePieceInput> = GAME_PIECES): GamePiece | null {
  const input = pieces[id];
  if (!input) return null;
  return { headline: input.headline, body: input.body, author: input.author ?? DEFAULT_PIECE_AUTHOR };
}

/**
 * Chip's call for this game, matched on existing call fields only (sport, "AWAY at HOME",
 * and the call date's year within the season window). Latest match wins.
 */
export function findGameCall(id: string, calls: Call[]): Call | null {
  const game = parseGameId(id);
  if (!game) return null;
  const label = `${game.away} AT ${game.home}`;
  const matches = calls.filter((call) => {
    if (call.sport.toUpperCase() !== game.sport || call.game.trim().toUpperCase() !== label) return false;
    const year = Number(call.date.slice(0, 4));
    return year === game.season || year === game.season + 1;
  });
  return matches.sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
}
