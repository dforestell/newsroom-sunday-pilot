import { HomeCast, HomeFeatured, HomeStories, StoryRows } from "@/components/home-sections";
import { SportFilter } from "@/components/sport-filter";
import { listPublicCalls } from "@/lib/calls";
import { listPublicStories } from "@/lib/stories";
import { shareMetadata } from "@/lib/share";

// Filed content is inlined at build time; admin content is read from Redis and refreshed
// every 30 seconds (or immediately after an admin save).
export const revalidate = 30;

const description =
  "Stories and Chip Absolute’s calls from the Poor Form Desk. Entertainment only. Not reporting. Not betting advice.";
const share = shareMetadata("Poor Form Sports", description);

export const metadata = {
  ...share,
  title: { absolute: "Poor Form Sports" },
  openGraph: { ...share.openGraph, title: "Poor Form Sports" },
  twitter: { ...share.twitter, title: "Poor Form Sports" },
};

/** Still published on /stories; omit from the home lead + Stories shelf. */
const HOME_STORY_SKIP = new Set([
  "jacksonville-home-schedule-london-timeshare",
  "notice-of-relocation-temporary-recurring-annual",
]);

export default async function HomePage() {
  const [allStories, calls] = await Promise.all([listPublicStories(), listPublicCalls()]);
  const [latest, ...stories] = allStories.filter((story) => !HOME_STORY_SKIP.has(story.slug));

  return (
    <div className="space-y-6">
      <section className="max-w-3xl space-y-1">
        <h1 className="font-heading text-lg leading-snug font-normal text-balance text-ink-soft italic sm:text-2xl">
          Sports opinions worth arguing about, from a{"\u00a0"}cast whose bad takes stay on the record.
        </h1>
      </section>

      <HomeFeatured story={latest} calls={calls} />
      <HomeStories
        stories={stories.slice(0, 3)}
        filter={
          <SportFilter
            label="Filter stories by sport"
            panels={{
              All: <StoryRows stories={stories.slice(0, 3)} />,
              NFL: <StoryRows stories={stories.filter((s) => s.sport === "NFL").slice(0, 3)} empty="No NFL stories yet." />,
              NBA: <StoryRows stories={stories.filter((s) => s.sport === "NBA").slice(0, 3)} empty="No NBA stories yet." />,
            }}
          />
        }
      />
      <HomeCast />
    </div>
  );
}
