import Link from "next/link";
import { notFound } from "next/navigation";
import { StoryLabel } from "@/components/story-label";
import { StoryArticle } from "@/components/story-article";
import { getPublicStory, listPublicStories, listStories, storyVoice } from "@/lib/stories";
import { shareMetadata } from "@/lib/share";

// Filed stories prebuild; published admin stories render on demand.
export const dynamicParams = true;

export function generateStaticParams() {
  return listStories().map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/stories/[slug]">) {
  const { slug } = await params;
  const story = await getPublicStory(slug);
  return story
    ? shareMetadata(story.title, story.dek)
    : { title: "Story" };
}

export default async function StoryArticlePage({
  params,
}: PageProps<"/stories/[slug]">) {
  const { slug } = await params;
  const all = await listPublicStories();
  const story = all.find((item) => item.slug === slug);
  if (!story) {
    notFound();
  }
  const index = all.findIndex((item) => item.slug === story.slug);
  // Next newer story; the latest story points at the one before it instead of itself.
  const next = index > 0 ? all[index - 1] : all[1];
  const nextVoice = next ? storyVoice(next) : undefined;
  const more = all.filter((item) => item.slug !== story.slug && item.slug !== next?.slug).slice(0, 3);

  return (
    <StoryArticle story={story}>
      {next ? (
        <section aria-label="Next story" className="border-t border-border pt-5">
          <p className="font-mono text-[11px] tracking-[0.18em] text-masthead uppercase">Next story</p>
          <Link href={`/stories/${next.slug}`} className="mt-1 block max-w-3xl hover:underline">
            <span className="block font-heading text-[22px] leading-snug font-semibold break-words">{next.title}</span>
            <span className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-wide text-ink-soft uppercase">
              <StoryLabel label={next.label} />
              <span>
                {nextVoice ? `${nextVoice.name} · ` : ""}
                {next.dateLabel}
              </span>
            </span>
          </Link>
          {more.length > 0 ? (
            <>
              <p className="mt-5 font-mono text-[11px] tracking-[0.18em] text-masthead uppercase">More stories</p>
              <ul className="mt-1">
                {more.map((item) => (
                  <li key={item.slug}>
                    <Link href={`/stories/${item.slug}`} className="inline-flex min-h-11 items-center gap-2 text-sm underline-offset-4 hover:text-masthead hover:underline">
                      <StoryLabel label={item.label} />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      ) : null}
    </StoryArticle>
  );
}
