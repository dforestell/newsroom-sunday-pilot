import Link from "next/link";
import type { NflGame } from "@/lib/nfl/types";
import { gamePresentation } from "@/lib/nfl/presentation";

export function GameScoreCard({ game, stale, featured = false, details = false }: {
  game: NflGame; stale: boolean; featured?: boolean; details?: boolean;
}) {
  const { live, label, badge, clock, possessionTeamId } = gamePresentation(game, stale);
  const kickoff = game.kickoffAt ? new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago", weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
  }).format(new Date(game.kickoffAt)) : "Kickoff TBD";

  return (
    <article className="min-w-0 bg-bar text-bar-foreground" aria-label={`${game.away.name} at ${game.home.name}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3">
        <p className="font-mono text-[10px] tracking-wide text-bar-foreground/70 uppercase">
          {game.seasonType === 1 ? "Preseason" : game.seasonType === 3 ? "Postseason" : "Regular season"} · Week {game.week}
        </p>
        <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase ${live ? "bg-live-green text-ink" : stale ? "bg-demo text-ink" : "border border-bar-foreground/30"}`}>
          {badge}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-4">
        {[game.away, game.home].map((team, index) => (
          <div key={team.id} className={index === 1 ? "col-start-3 row-start-1 text-right" : "col-start-1 row-start-1"}>
            <p className={`font-mono leading-none font-medium tabular-nums ${featured ? "text-5xl sm:text-6xl" : "text-4xl"}`}>{team.score ?? "—"}</p>
            <p className="mt-2 font-mono text-sm tracking-wide">
              {team.abbreviation}
              {possessionTeamId === team.id ? <span className="ml-1 text-live-green" aria-label="Possession">●</span> : null}
            </p>
            <p className="mt-0.5 text-xs text-bar-foreground/65">{team.name}</p>
          </div>
        ))}
        <div className="col-start-2 row-start-1 max-w-28 text-center font-mono text-[10px] uppercase">
          <p>{label}</p>
          {clock ? <p className="mt-1">{clock}</p> : null}
          <p className="mt-1 text-bar-foreground/45">at</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-bar-foreground/15 px-4 py-3">
        <p className="font-mono text-[10px] text-bar-foreground/65">{kickoff}</p>
        {game.blogUrl ? (
          <Link href={game.blogUrl} className="font-mono text-[10px] text-live-green uppercase underline underline-offset-4">Enter blog →</Link>
        ) : !details ? (
          <Link href={`/scores/${encodeURIComponent(game.id)}`} className="font-mono text-[10px] uppercase underline underline-offset-4">Game details →</Link>
        ) : null}
      </div>
    </article>
  );
}
