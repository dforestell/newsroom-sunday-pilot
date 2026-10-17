import { StoryCard } from "@/components/story-card";
import { listStories } from "@/lib/stories";
import { shareMetadata } from "@/lib/share";

export const metadata = shareMetadata(
  "Stories",
  "Filed columns from the Poor Form Desk. Entertainment only. Not reporting. Not betting advice.",
);

export default function StoriesIndexPage() {
  const stories = listStories();
  const [featured, ...rest] = stories;

  return (
    <div className="space-y-6">
      <section className="max-w-3xl space-y-2">
        <p className="font-mono text-[11px] tracking-[0.18em] text-masthead uppercase">
          Poor Form Desk
        </p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight break-words sm:text-5xl">
          Stories
        </h1>
        <p className="text-sm leading-6 text-ink-soft sm:text-base">
          Filed columns from the Poor Form Desk. Latest first. Entertainment only.
        </p>
      </section>

      {stories.length > 0 ? (
        <div className="space-y-3">
          {featured ? <StoryCard story={featured} featured /> : null}
          {rest.length > 0 ? (
            <ul className="space-y-3">
              {rest.map((story) => (
                <li key={story.slug}>
                  <StoryCard story={story} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
