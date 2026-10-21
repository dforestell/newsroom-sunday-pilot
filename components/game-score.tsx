import { Badge } from "@/components/ui/badge";
import { formatScore, statusLabel } from "@/lib/copy";
import { cn } from "@/lib/utils";
import type { Game, GameStatus, OfficialScore } from "@/lib/types";

export function GameScore({
  game,
  score = game.officialScore,
  status = game.status,
  clockLabel = game.clockLabel,
  simulated = false,
}: {
  game: Game;
  score?: OfficialScore;
  status?: GameStatus;
  clockLabel?: string | null;
  simulated?: boolean;
}) {
  const demo = Boolean(game.demo) && !simulated;

  return (
    <section
      className={cn(
        "border px-4 py-4 sm:px-5",
        simulated && "border-sim bg-card",
        demo && "border-demo bg-bar text-bar-foreground",
        !simulated && !demo && "border-ink/15 bg-card",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p
            className={cn(
              "font-mono text-[11px] tracking-[0.18em] uppercase",
              demo ? "text-bar-foreground/80" : "text-masthead",
            )}
          >
            {game.windowLabel}
          </p>
          <h1
            className={cn(
              "font-heading text-2xl font-semibold tracking-tight sm:text-3xl",
              demo && "text-bar-foreground",
            )}
          >
            {game.name}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {simulated ? (
            <Badge className="bg-sim text-sim-foreground font-mono text-[10px] tracking-wide uppercase">
              Simulated
            </Badge>
          ) : demo ? (
            <Badge className="bg-demo text-ink font-mono text-[10px] tracking-wide uppercase">
              Archive
            </Badge>
          ) : (
            <Badge variant="outline" className="font-mono text-[10px] uppercase">
              Public
            </Badge>
          )}
          <Badge
            variant={demo ? "secondary" : "secondary"}
            className={cn(
              "font-mono text-[10px] uppercase",
              demo && "border-bar-foreground/25 bg-transparent text-bar-foreground",
            )}
          >
            <span data-replay-status={simulated ? "" : undefined}>
              {statusLabel(status)}
            </span>
          </Badge>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
        <div>
          <p
            className={cn(
              "font-mono font-semibold tracking-tight",
              demo ? "text-5xl sm:text-6xl" : "text-4xl font-medium sm:text-5xl",
            )}
            data-replay-away={simulated ? "" : undefined}
          >
            {formatScore(score.away)}
          </p>
          <p className={cn("mt-0.5 font-heading text-base sm:text-lg", demo && "text-bar-foreground")}>
            {game.away.name}
          </p>
          <p
            className={cn(
              "font-mono text-xs tracking-wide uppercase",
              demo ? "text-bar-foreground/60" : "text-ink/50",
            )}
          >
            {game.away.short}
            {simulated ? " · alias" : demo ? " · Away" : " · Away"}
          </p>
        </div>
        <div
          className={cn(
            "text-center font-mono text-[10px] tracking-wide uppercase sm:text-xs",
            demo ? "text-bar-foreground/55" : "text-ink/45",
          )}
        >
          <p data-replay-clock={simulated ? "" : undefined}>
            {clockLabel ?? "No official clock"}
          </p>
          <p className={cn("mt-1 text-2xl font-semibold", demo ? "text-bar-foreground" : "text-ink/30")}>
            –
          </p>
        </div>
        <div className="text-right">
          <p
            className={cn(
              "font-mono font-semibold tracking-tight",
              demo ? "text-5xl sm:text-6xl" : "text-4xl font-medium sm:text-5xl",
            )}
            data-replay-home={simulated ? "" : undefined}
          >
            {formatScore(score.home)}
          </p>
          <p className={cn("mt-0.5 font-heading text-base sm:text-lg", demo && "text-bar-foreground")}>
            {game.home.name}
          </p>
          <p
            className={cn(
              "font-mono text-xs tracking-wide uppercase",
              demo ? "text-bar-foreground/60" : "text-ink/50",
            )}
          >
            {game.home.short}
            {simulated ? " · alias" : " · Home"}
          </p>
        </div>
      </div>
      {demo ? (
        <p className="mt-3 font-mono text-[10px] tracking-[0.14em] text-demo-foreground uppercase">
          Archive scorebug · {game.away.short} {formatScore(score.away)} –{" "}
          {game.home.short} {formatScore(score.home)} · not live
        </p>
      ) : null}
      {simulated ? (
        <p className="mt-3 font-mono text-[10px] tracking-wide text-ink/55 uppercase">
          Desk aliases · not Melbourne · not public
        </p>
      ) : null}
    </section>
  );
}
