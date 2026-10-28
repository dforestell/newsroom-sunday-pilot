"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GameScoreCard } from "./game-score-card";
import { CompactScoreRows } from "./compact-score-rows";
import { NFL_BLOG_LINKS } from "@/lib/nfl/coverage";
import type { NflGame, ScoreboardResponse } from "@/lib/nfl/types";
import { scoreboardPresentation } from "@/lib/nfl/presentation";

function isScoreboard(value: unknown): value is ScoreboardResponse {
  if (!value || typeof value !== "object") return false;
  const data = value as ScoreboardResponse;
  return Array.isArray(data.games) && ["fresh", "stale", "unavailable"].includes(data.availability) &&
    typeof data.nextPollMs === "number" && Number.isFinite(data.nextPollMs) &&
    typeof data.staleAfterMs === "number" && Number.isFinite(data.staleAfterMs) &&
    (data.lastSuccessfulFetchAt === null || Number.isFinite(Date.parse(data.lastSuccessfulFetchAt)));
}

function PilotBoardNotice({ gameId }: { gameId?: string }) {
  return (
    <div className="border-2 border-masthead bg-card-loud px-4 py-6 text-left">
      <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">Pilot mode</p>
      <h3 className="mt-1 font-heading text-2xl font-semibold">The live board is asleep.</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
        The league is fine. The live board is quiet, so it will not pretend empty space is an NFL Sunday. The Melbourne, SNF and MNF archives below are open.
      </p>
      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 font-mono text-sm tracking-wide text-masthead uppercase">
        <Link href="/games/sunday-pilot" className="underline-offset-4 hover:underline">Melbourne</Link>
        <Link href="/games/demo-dal-nyg-snf" className="underline-offset-4 hover:underline">SNF</Link>
        <Link href="/games/demo-den-kc-mnf" className="underline-offset-4 hover:underline">MNF</Link>
        <Link href="/stories" className="underline-offset-4 hover:underline">Desk stories</Link>
        <Link href="/about" className="underline-offset-4 hover:underline">About</Link>
      </div>
      {gameId ? <p className="mt-4 text-[13px] text-ink-soft">That live-game detail is unavailable until the pilot board wakes up.</p> : null}
    </div>
  );
}

export function LiveScoreboard({ gameId, compact = false, initialData = null }: { gameId?: string; compact?: boolean; initialData?: ScoreboardResponse | null }) {
  // Server-rendered last-known board, so the page never opens on an empty loader.
  const [data, setData] = useState<ScoreboardResponse | null>(initialData && isScoreboard(initialData) && initialData.availability !== "unavailable" ? initialData : null);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    let disposed = false;
    let running = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;
    let pollMs = 15_000;

    async function refresh() {
      if (disposed || running || document.hidden) return;
      clearTimeout(timer);
      running = true;
      controller = new AbortController();
      const timeout = setTimeout(() => controller?.abort(), 30_000);
      try {
        const response = await fetch("/api/nfl/scores", { signal: controller.signal });
        const result: unknown = await response.json();
        if (!response.ok || !isScoreboard(result) || result.availability === "unavailable") throw new Error("Scores unavailable");
        if (!disposed) {
          setData(result);
          setFailed(false);
          setNow(Date.now());
          pollMs = Math.min(300_000, Math.max(15_000, result.nextPollMs));
        }
      } catch {
        if (!disposed) {
          // Keep the last response and its original timestamps on HTTP/network failure.
          setFailed(true);
          setNow(Date.now());
          pollMs = 15_000;
        }
      } finally {
        clearTimeout(timeout);
        running = false;
        if (!disposed && !document.hidden) timer = setTimeout(refresh, pollMs);
      }
    }

    const visible = () => {
      clearTimeout(timer);
      if (!document.hidden) void refresh();
    };
    const tick = setInterval(() => setNow(Date.now()), 10_000);
    document.addEventListener("visibilitychange", visible);
    window.addEventListener("online", visible);
    void refresh();
    return () => {
      disposed = true;
      clearTimeout(timer);
      clearInterval(tick);
      controller?.abort();
      document.removeEventListener("visibilitychange", visible);
      window.removeEventListener("online", visible);
    };
  }, []);

  const { stale, status } = scoreboardPresentation(data, failed, now);
  const games = (data?.games ?? []).filter(game => !gameId || game.id === gameId).map((game): NflGame => {
    const url = NFL_BLOG_LINKS[game.id];
    return { ...game, blogUrl: url?.startsWith("/") && !url.startsWith("//") ? url : null };
  });
  const featured = games.find(g => g.state === "in_progress") ?? games.find(g => g.state === "scheduled") ?? games.at(-1);
  const others = games.filter(g => g.id !== featured?.id);

  if (compact) {
    return (
      <section aria-label="NFL scoreboard" aria-busy={!data && !failed}>
        <div className="flex flex-wrap items-center justify-between gap-2 bg-bar px-3 py-2 text-bar-foreground">
          <h2 className="font-mono text-sm tracking-[0.18em] uppercase">NFL scoreboard</h2>
          <p className={`font-mono text-xs uppercase ${stale ? "text-demo" : "text-bar-foreground/70"}`}>{status}</p>
        </div>
        <p role="status" className="sr-only">{!data ? failed ? "Scores temporarily unavailable." : "Loading scoreboard." : stale ? "Score updates are delayed." : "Scoreboard available."}</p>
        {games.length > 0 ? <CompactScoreRows games={games} stale={stale} /> : !data && failed ? <PilotBoardNotice /> : (
          <p className="border-x border-b border-ink/15 bg-card-loud px-3 py-3 text-sm text-ink-soft">
            {!data ? "Fetching NFL scores…" : "No games scheduled in this window."}
          </p>
        )}
        <Link href="/scores" className="inline-flex min-h-11 items-center font-mono text-sm tracking-wide text-masthead uppercase underline-offset-4 hover:underline">All games →</Link>
      </section>
    );
  }

  return (
    <section className="space-y-3" aria-label="NFL scoreboard" aria-busy={!data && !failed}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">NFL scoreboard</p>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">{gameId ? "Game details" : "Around the league"}</h2>
        </div>
        <p className={`font-mono text-xs uppercase ${stale ? "text-warn" : "text-ink-soft"}`}>
          {status}
        </p>
      </div>
      <p role="status" className="sr-only">{!data ? failed ? "Scores temporarily unavailable." : "Loading scoreboard." : stale ? "Score updates are delayed." : "Scoreboard available."}</p>
      {featured ? <GameScoreCard game={featured} stale={stale} featured details={Boolean(gameId)} /> : (
        !data && failed ? <PilotBoardNotice gameId={gameId} /> : (
          <div className="border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-ink-soft">
            {!data ? "Fetching NFL scores…" : gameId ? "This game is outside the current scoreboard window." : "No games scheduled in this window."}
          </div>
        )
      )}
      {others.length > 0 ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{others.map(game => <GameScoreCard key={game.id} game={game} stale={stale} />)}</div> : null}
      {data ? <p className="text-[13px] text-ink-soft">Kickoff times shown in Central Time. Scores may lag the game.</p> : null}
      {gameId ? <Link href="/scores" className="font-mono text-sm text-masthead underline underline-offset-4">← All games</Link> : null}
    </section>
  );
}
