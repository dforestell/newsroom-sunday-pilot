import { HomeArchive, HomeCast, HomeFeatured, HomeStories } from "@/components/home-sections";
import { LiveScoreboard } from "@/components/scoreboard/live-scoreboard";
import { listPublicCalls } from "@/lib/calls";
import { listPublicStories } from "@/lib/stories";
import { shareMetadata } from "@/lib/share";

// Filed content is inlined at build time; admin content is read from Redis and refreshed
// every 30 seconds (or immediately after an admin save).
export const revalidate = 30;

export const metadata = shareMetadata(
  "NFL board + desk",
  "NFL scores and a desk with opinions from Poor Form Sports. Entertainment only. Not reporting. Not betting advice.",
  "/",
);

export default async function HomePage() {
  const [[latest, ...stories], calls] = await Promise.all([listPublicStories(), listPublicCalls()]);

  return (
    <div className="space-y-6">
      <section className="max-w-3xl space-y-1">
        <h1 className="font-heading text-lg leading-snug font-normal text-balance text-ink-soft italic sm:text-2xl">
          Football opinions worth arguing about, from a{"\u00a0"}cast whose bad takes stay on the record.
        </h1>
      </section>

      <HomeFeatured story={latest} calls={calls} />
      <LiveScoreboard compact />
      <HomeCast />
      <HomeStories stories={stories.slice(0, 3)} />
      <HomeArchive />
    </div>
  );
}
