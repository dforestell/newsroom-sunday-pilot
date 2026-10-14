import Script from "next/script";
import { lockReview } from "@/app/review/actions";
import { GameScore } from "@/components/game-score";
import { getSimulatedFixture } from "@/lib/simulated/fixture";
import {
  SIMULATED_REEL_MS,
  SIMULATED_TICK_MS,
  beatsThrough,
  clockAt,
  delayedAt,
  scoreAt,
  serializeReplayTape,
  statusAt,
} from "@/lib/simulated/replay";

export function ReplayDesk({ initialMs = 0 }: { initialMs?: number }) {
  const game = getSimulatedFixture();

  const entries = [...beatsThrough(initialMs)].reverse();
  const tapeJson = JSON.stringify(serializeReplayTape()).replace(/</g, "\\u003c");

  return (
    <div id="replay-root" className="space-y-5" data-cursor={initialMs}>
      <div className="border border-sim bg-sim px-4 py-3 text-sim-foreground">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase">
          Simulated · Review only
        </p>
        <p className="mt-1 text-sm">
          This reel is labeled SIMULATED on every beat. Greyshirts and Red
          Caps are desk aliases for this tape only — not public teams, not
          the Melbourne archive. The public board never loads this module.
        </p>
      </div>

      <div
        id="replay-delayed"
        hidden={!(delayedAt(initialMs) || (initialMs > 0 && initialMs < SIMULATED_REEL_MS))}
        className="border border-dashed border-masthead/50 bg-card px-4 py-3"
      >
        <span className="inline-flex h-5 items-center rounded-full bg-destructive/10 px-2 font-mono text-[10px] text-destructive uppercase">
          Updates delayed
        </span>
        <p id="replay-delayed-copy" className="mt-2 text-sm text-ink/70">
          Replay is paused. Resume to keep the simulated wire moving.
        </p>
      </div>

      <div className="space-y-3 border border-ink/15 bg-card px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-[11px] tracking-wide uppercase">
                Replay ·{" "}
                <span id="replay-clock">
                  {(initialMs / 1000).toFixed(1)}s / {SIMULATED_REEL_MS / 1000}s
                </span>
              </p>
              <span
                id="replay-state"
                className="inline-flex h-5 items-center rounded-full border border-border px-2 font-mono text-[10px] uppercase"
              >
                {initialMs >= SIMULATED_REEL_MS ? "Ended" : "Paused"}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink/65">
              Play walks the SIMULATED alias tape. Pause is a feed-resilience stub.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              id="replay-play"
              type="button"
              data-testid="replay-play"
              className="inline-flex h-10 items-center rounded-md bg-masthead px-4 font-mono text-xs tracking-wide text-primary-foreground uppercase hover:bg-masthead/90"
            >
              Play
            </button>
            <button
              id="replay-rewind"
              type="button"
              data-testid="replay-rewind"
              className="inline-flex h-10 items-center rounded-md border border-ink/20 px-4 font-mono text-xs tracking-wide uppercase hover:bg-muted"
            >
              Rewind
            </button>
            <form action={lockReview}>
              <button
                type="submit"
                className="inline-flex h-10 items-center px-3 font-mono text-xs tracking-wide text-ink/70 uppercase hover:text-ink"
              >
                Lock desk
              </button>
            </form>
          </div>
        </div>
        <label className="block space-y-1">
          <span className="font-mono text-[11px] tracking-wide text-ink/50 uppercase">
            Scrub tape
          </span>
          <input
            id="replay-scrub"
            data-testid="replay-scrub"
            type="range"
            min={0}
            max={SIMULATED_REEL_MS}
            step={SIMULATED_TICK_MS}
            defaultValue={initialMs}
            className="w-full accent-masthead"
          />
        </label>
        <noscript>
          <form method="get" className="pt-1">
            <input type="hidden" name="t" value={String(SIMULATED_REEL_MS)} />
            <button
              type="submit"
              className="font-mono text-sm tracking-wide text-masthead uppercase underline-offset-4 hover:underline"
            >
              Show full SIMULATED tape
            </button>
          </form>
        </noscript>
      </div>

      <GameScore
        game={game}
        score={scoreAt(initialMs)}
        status={statusAt(initialMs)}
        clockLabel={clockAt(initialMs)}
        simulated
      />

      <section className="space-y-3">
        <div>
          <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">
            Simulated live blog
          </p>
          <h2 className="font-heading text-2xl font-semibold">Timeline</h2>
        </div>
        <div id="replay-timeline">
          {entries.length === 0 ? (
            <div className="border border-dashed border-ink/20 px-4 py-12 text-center">
              <p className="font-heading text-lg font-semibold">Tape is cued</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink/65">
                Press Play to walk the SIMULATED Sunday reel. Facts, commentary,
                a duplicate, a correction, and a delayed hitch are on the tape.
              </p>
            </div>
          ) : (
            <p className="text-sm text-ink/60">Loading tape…</p>
          )}
        </div>
      </section>

      <script
        id="replay-tape"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: tapeJson }}
      />
      <Script src="/review-replay.js" strategy="afterInteractive" />
    </div>
  );
}
