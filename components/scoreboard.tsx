import Link from "next/link";
import { DeskPill } from "@/components/desk-pill";
import { formatScore } from "@/lib/copy";
import type { Game } from "@/lib/types";

export function Scoreboard({ games }: { games: Game[] }) {
  const archive = games.filter((game) => game.demo && !game.simulated && game.id !== "sunday-pilot");
  if (archive.length === 0) return null;

  return (
    <section aria-labelledby="archive-heading" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">
            Filed archive · not live
          </p>
          <h2 id="archive-heading" className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            Archive
          </h2>
        </div>
        <span className="inline-flex h-5 items-center rounded-full border border-border px-2 font-mono text-xs tracking-wide text-ink-soft uppercase">
          Archive
        </span>
      </div>
      {archive.length > 0 ? (
        <div>
          <ul className="divide-y divide-border border border-border">
            {archive.map((game) => (
              <li key={game.id}>
                <Link
                  href={`/games/${game.id}`}
                  className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 hover:bg-card-loud sm:px-5"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <DeskPill tone="outline">Archive</DeskPill>
                    <span className="text-sm font-medium">{game.windowLabel} · {game.away.short} @ {game.home.short}</span>
                  </span>
                  <span className="min-w-0 font-mono text-[13px] text-ink-soft">
                    {game.status === "final" ? "Final" : "Archive"} · {formatScore(game.officialScore.away)}–{formatScore(game.officialScore.home)} · View archive →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
