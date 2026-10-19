import Link from "next/link";
import { DeskPill } from "@/components/desk-pill";
import { StoryCard } from "@/components/story-card";
import { demoChrome } from "@/lib/demo/banners";
import { listPublicGames } from "@/lib/live/public";
import { listPublicStories } from "@/lib/stories";
import { shareMetadata } from "@/lib/share";

// Filed content is inlined at build time; admin content is read from Redis and refreshed
// every 30 seconds (or immediately after an admin save).
export const revalidate = 30;

export const metadata = shareMetadata(
  "Archive",
  "Filed game archives and past columns from the Poor Form Desk. Never live scores.",
  "/archive",
);

export default async function ArchiveIndexPage() {
  const games = listPublicGames().filter((game) => game.demo);
  const stories = await listPublicStories();

  return (
    <div className="space-y-8">
      <section className="max-w-3xl space-y-2">
        <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">Poor Form Desk</p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight break-words sm:text-5xl">Archive</h1>
        <p className="text-sm leading-6 text-ink-soft sm:text-base">
          Filed game timelines and past columns. Archives are written after the final whistle and are never live scores.
        </p>
      </section>

      <section aria-labelledby="archive-games" className="space-y-3">
        <h2 id="archive-games" className="font-heading text-2xl font-semibold">Games</h2>
        <ul className="divide-y divide-border border-y border-border">
          {games.map((game) => {
            const chrome = demoChrome(game.id);
            return (
              <li key={game.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <Link href={`/games/${game.id}`} className="font-heading text-lg font-semibold underline-offset-4 hover:underline">
                    {game.name}
                  </Link>
                  <p className="font-mono text-[13px] tracking-wide text-ink-soft uppercase">
                    {chrome?.kicker ?? game.windowLabel} · Final · {game.away.short} {game.officialScore.away}–{game.officialScore.home} {game.home.short}
                  </p>
                  <p className="font-mono text-[13px] tracking-wide text-ink-soft uppercase">
                    {chrome?.sources ?? game.feedNote}
                    {chrome?.sourceLinks?.map((link) => (
                      <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="ml-2 text-masthead underline-offset-4 hover:underline">
                        {link.label}
                      </a>
                    ))}
                  </p>
                </div>
                <DeskPill tone="outline">Archive</DeskPill>
              </li>
            );
          })}
        </ul>
      </section>

      {stories.length > 0 ? (
        <section aria-labelledby="archive-stories" className="space-y-3">
          <h2 id="archive-stories" className="font-heading text-2xl font-semibold">Stories</h2>
          <ul className="space-y-3">
            {stories.map((story) => (
              <li key={story.slug}>
                <StoryCard story={story} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
