import { HomeArchive, HomeCast, HomeFeatured, HomeStories } from "@/components/home-sections";
import { LiveScoreboard } from "@/components/scoreboard/live-scoreboard";
import { listCalls } from "@/lib/calls";
import { listStories } from "@/lib/stories";
import { shareMetadata } from "@/lib/share";

export const metadata = shareMetadata(
  "NFL board + desk",
  "NFL scores and a desk with opinions from Poor Form Sports. Entertainment only. Not reporting. Not betting advice.",
);

export default function HomePage() {
  const [latest, ...stories] = listStories();

  return (
    <div className="space-y-6">
      <section className="max-w-3xl space-y-1">
        <h1 className="font-heading text-lg leading-snug font-normal text-ink-soft italic sm:text-2xl">
          Football opinions worth arguing about, from a cast whose bad takes stay on the record.
        </h1>
      </section>

      <HomeFeatured story={latest} calls={listCalls()} />
      <LiveScoreboard compact />
      <HomeCast />
      <HomeStories stories={stories.slice(0, 3)} />
      <HomeArchive />
    </div>
  );
}
