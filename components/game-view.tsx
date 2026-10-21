import Link from "next/link";
import { notFound } from "next/navigation";
import { DeskPill } from "@/components/desk-pill";
import { EntryList } from "@/components/entry-list";
import { GameScore } from "@/components/game-score";
import { PublicFeedControls } from "@/components/public-feed-controls";
import { MiniScorebug } from "@/components/scorebug";
import { demoChrome } from "@/lib/demo/banners";
import { getBlogger, getPublicGame, getPublicLiveBlog, voicesForDemoGame } from "@/lib/live/public";

export function GameView({ id, paused }: { id: string; paused: boolean }) {
  const game = getPublicGame(id);
  if (!game) {
    notFound();
  }

  const entries = getPublicLiveBlog(game.id);
  const blogger = game.assignedBloggerId
    ? getBlogger(game.assignedBloggerId)
    : undefined;
  const chrome = demoChrome(game.id);
  const voices = game.demo ? voicesForDemoGame(game.id) : [];

  if (game.demo) {
    return (
      <div className="-mx-4 space-y-5 sm:-mx-6">
        <MiniScorebug game={game} sticky />
        <div className="space-y-5 px-4 sm:px-6">
          <div>
            <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">
              {chrome?.kicker ?? game.windowLabel}
            </p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight break-words sm:text-4xl">
              {game.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              {blogger ? (
                <p>
                  Lead:{" "}
                  <Link
                    href={`/staff/${blogger.id}`}
                    className="text-masthead underline-offset-4 hover:underline"
                  >
                    {blogger.name}
                  </Link>
                </p>
              ) : null}
              <DeskPill tone="outline">Archive</DeskPill>
              <DeskPill tone="final">Final</DeskPill>
            </div>
            <p className="mt-2 font-mono text-[13px] tracking-wide text-ink-soft uppercase">
              {chrome?.sources ?? game.feedNote}
            </p>
            {chrome?.sourceLinks?.length ? (
              <p className="mt-1 flex flex-wrap gap-x-3 font-mono text-[11px] tracking-wide uppercase">
                {chrome.sourceLinks.map((link) => (
                  <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-masthead underline-offset-4 hover:underline">
                    {link.label}
                  </a>
                ))}
              </p>
            ) : null}
            {voices.length > 0 ? (
              <div className="mt-4 border-t border-border pt-3">
                <p className="font-mono text-[11px] tracking-[0.18em] text-demo uppercase">Voices in this archive</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {voices.map((voice) => (
                    <Link key={voice.slug} href={`/staff/${voice.slug}`} className="inline-flex min-h-11 items-center border border-border bg-card px-3 text-sm underline-offset-4 hover:underline">
                      {voice.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <section className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
                Timeline
              </h2>
              <DeskPill tone="outline">Filed timeline</DeskPill>
            </div>
            <p className="text-sm text-ink-soft">
              This game is final. Read the filed timeline below; this page is not a live feed.
            </p>
            <EntryList
              entries={entries}
              emptyTitle="No official hooks yet"
              emptyBody="The blog is open, but the public-live path will not invent a play or a score. Commentary waits on facts."
            />
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="flex min-w-0 flex-wrap items-center gap-x-2 font-mono text-[13px] tracking-wide uppercase">
        <Link href="/" className="inline-flex min-h-11 items-center text-ink-soft hover:text-masthead">
          Scoreboard
        </Link>
        <span className="text-ink/30" aria-hidden="true">/</span>
        <span className="min-w-0 break-words">{game.name}</span>
      </p>

      <GameScore game={game} />

      <p className="text-sm text-ink-soft">{game.feedNote}</p>

      {game.liveBlogEnabled ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">
                Editorial live blog
              </p>
              <h2 className="font-heading text-xl font-semibold sm:text-2xl">
                Timeline
              </h2>
            </div>
          </div>
          <PublicFeedControls paused={paused} gameId={game.id} />
          <EntryList
            entries={entries}
            emptyTitle="No official hooks yet"
            emptyBody="The blog is open, but the public-live path will not invent a play or a score. Commentary waits on facts."
          />
        </section>
      ) : (
        <section className="border border-dashed border-border px-4 py-8">
          <DeskPill tone="outline">Flag off</DeskPill>
          <h2 className="mt-3 font-heading text-2xl font-semibold">
            Live blog is not enabled
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">
            Editorial left this game as scoreboard-only. Scores stay — unless
            an archive result is on the board.
          </p>
        </section>
      )}
    </div>
  );
}
