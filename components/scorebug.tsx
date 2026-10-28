import Link from "next/link";
import { DeskPill } from "@/components/desk-pill";
import { formatScore } from "@/lib/copy";
import { cn } from "@/lib/utils";
import type { Game } from "@/lib/types";

export function HeroScorebug({ game }: { game: Game }) {
  const href = `/games/${game.id}`;

  return (
      <Link
      href={href}
      className="block min-w-0 rounded-none bg-bar text-bar-foreground no-underline"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-4">
        <p className="font-mono text-[10px] tracking-[0.16em] text-demo uppercase">
          {game.windowLabel} · {game.status === "final" ? "Final" : game.status} ·{" "}
          {game.demo ? "Archive" : game.liveBlogEnabled ? "Blog on" : "Blog off"}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {game.demo ? <DeskPill tone="outline">Archive</DeskPill> : null}
          {game.status === "final" ? (
            <DeskPill
              tone="final"
              className="border border-bar-foreground/25 bg-transparent"
            >
              Final
            </DeskPill>
          ) : null}
          {game.demo ? null : game.liveBlogEnabled ? (
            <DeskPill tone="live">Blog on</DeskPill>
          ) : (
            <DeskPill tone="outline" className="border-bar-foreground/30 text-bar-foreground/80">
              Blog off
            </DeskPill>
          )}
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 pb-3 sm:px-4">
        <div>
          <p className="font-mono text-[44px] leading-none font-medium tracking-tight sm:text-[56px]">
            {formatScore(game.officialScore.away)}
          </p>
          <p className="mt-1 font-mono text-[11px] tracking-wide text-bar-foreground/55 uppercase">
            {game.away.short}
          </p>
          <p className="text-sm break-words text-bar-foreground/80">
            {game.away.name} · Away
          </p>
        </div>
        <div className="text-center font-mono text-[10px] tracking-[0.18em] text-demo uppercase">
          <p>Final</p>
          <p className="mt-1 text-bar-foreground/45">vs</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[44px] leading-none font-medium tracking-tight sm:text-[56px]">
            {formatScore(game.officialScore.home)}
          </p>
          <p className="mt-1 font-mono text-[11px] tracking-wide text-bar-foreground/55 uppercase">
            {game.home.short}
          </p>
          <p className="text-sm break-words text-bar-foreground/80">
            {game.home.name} · Home
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-bar-foreground/10 px-3 py-2 sm:px-4">
        <p className="font-mono text-[10px] tracking-[0.14em] text-demo uppercase">
          Open {game.windowLabel} {game.demo ? "archive" : "timeline"} →
        </p>
        <span className="inline-flex h-7 items-center rounded-full bg-demo px-3 font-mono text-[10px] tracking-wide text-ink uppercase">
          {game.demo ? "View archive" : "Enter blog"}
        </span>
      </div>
    </Link>
  );
}

export function GhostWindowCard({ game }: { game: Game }) {
  return (
    <Link
      href={`/games/${game.id}`}
      className="block border border-border/70 bg-card/50 px-3 py-2.5 opacity-70 transition-opacity hover:opacity-90 sm:px-4"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-xs tracking-[0.16em] text-ink-soft uppercase">
          {game.windowLabel} · Scheduled
        </p>
        <DeskPill tone="outline">Blog off</DeskPill>
      </div>
      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center font-mono">
        <div>
          <p className="text-2xl font-medium text-ink-soft">
            {formatScore(game.officialScore.away)}
          </p>
          <p className="text-[11px] tracking-wide uppercase">{game.away.short}</p>
        </div>
        <span className="text-xs text-ink-soft/70">@</span>
        <div className="text-right">
          <p className="text-2xl font-medium text-ink-soft">
            {formatScore(game.officialScore.home)}
          </p>
          <p className="text-[11px] tracking-wide uppercase">{game.home.short}</p>
        </div>
      </div>
    </Link>
  );
}

export function MiniScorebug({
  game,
  sticky = false,
}: {
  game: Game;
  sticky?: boolean;
}) {
  return (
    <div
      className={cn(
        "z-40 flex min-w-0 items-center gap-2 bg-bar px-3 py-1 text-bar-foreground sm:gap-3 sm:px-4",
        sticky && "sticky top-10",
      )}
    >
      <Link
        href="/"
        className="inline-flex min-h-11 shrink-0 items-center font-mono text-[11px] tracking-[0.14em] text-demo uppercase hover:text-bar-foreground"
      >
        ← Board
      </Link>
      <p className="min-w-0 flex-1 truncate text-center font-mono text-sm font-medium tracking-tight sm:text-base">
        {game.away.short} {formatScore(game.officialScore.away)}
        <span className="mx-1.5 text-bar-foreground/40">–</span>
        {game.home.short} {formatScore(game.officialScore.home)}
      </p>
      <div className="flex shrink-0 items-center gap-1.5">
        <DeskPill
          tone="final"
          className="border border-bar-foreground/25 bg-transparent"
        >
          Final
        </DeskPill>
        {game.demo ? <DeskPill tone="outline">Archive</DeskPill> : null}
      </div>
    </div>
  );
}

export function AssignedScorebug({ game }: { game: Game }) {
  return (
    <Link href={`/games/${game.id}`} className="block rounded-none bg-bar text-bar-foreground">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-4">
        <p className="font-mono text-[10px] tracking-[0.16em] text-demo uppercase">
          {game.windowLabel} · Final · {game.demo ? "Archive" : "Blog on"}
        </p>
        <div className="flex gap-1.5">
          <DeskPill tone="outline">Archive</DeskPill>
          <DeskPill
            tone="final"
            className="border border-bar-foreground/25 bg-transparent"
          >
            Final
          </DeskPill>
        </div>
      </div>
      <div className="px-3 pb-2 sm:px-4">
        <p className="font-heading text-xl font-semibold sm:text-2xl">
          {game.name}
        </p>
        <p className="mt-1 font-mono text-2xl font-medium tracking-tight sm:text-3xl">
          {game.away.short} {formatScore(game.officialScore.away)}
          <span className="mx-2 text-bar-foreground/40">–</span>
          {game.home.short} {formatScore(game.officialScore.home)}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-bar-foreground/10 px-3 py-2 sm:px-4">
        <p className="font-mono text-[10px] tracking-[0.14em] text-demo uppercase">
          Open {game.windowLabel} timeline →
        </p>
        <span className="inline-flex h-7 items-center rounded-full bg-demo px-3 font-mono text-[10px] tracking-wide text-ink uppercase">
          {game.demo ? "View archive" : "Enter blog"}
        </span>
      </div>
    </Link>
  );
}
