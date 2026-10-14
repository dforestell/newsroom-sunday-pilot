import Link from "next/link";
import type { NflGame } from "@/lib/nfl/types";
import { gamePresentation } from "@/lib/nfl/presentation";

export const COMPACT_ROW_LIMIT = 6;

function status(game: NflGame, stale: boolean) {
  const { live, label, clock } = gamePresentation(game, stale);
  if (live) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden className="size-2 rounded-full bg-live-green" />
        Live{clock ? ` · ${clock}` : ""}
      </span>
    );
  }
  if (game.state === "scheduled" && game.kickoffAt) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "2-digit", timeZoneName: "short",
    }).format(new Date(game.kickoffAt));
  }
  return clock ? `${label} ${clock}` : label;
}

export function CompactScoreRows({ games, stale }: { games: NflGame[]; stale: boolean }) {
  return (
    <ul className="divide-y divide-ink/15 border-x border-b border-ink/15 bg-card-loud">
      {games.slice(0, COMPACT_ROW_LIMIT).map((game) => (
        <li key={game.id}>
          <Link
            href={game.blogUrl ?? `/scores/${encodeURIComponent(game.id)}`}
            aria-label={`${game.away.name} at ${game.home.name}`}
            className="grid h-12 grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 font-mono text-base tabular-nums hover:bg-paper"
          >
            <span>
              {game.away.abbreviation} <span className="font-semibold">{game.away.score ?? "–"}</span>
            </span>
            <span className="text-center text-[11px] tracking-wide text-ink-soft uppercase">{status(game, stale)}</span>
            <span className="text-right">
              <span className="font-semibold">{game.home.score ?? "–"}</span> {game.home.abbreviation}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
