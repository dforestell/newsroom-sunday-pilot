import Link from "next/link";
import { StoryBody } from "@/components/story-body";
import { notFound } from "next/navigation";
import { StoryLabel } from "@/components/story-label";
import { VoiceAvatar } from "@/components/voice-avatar";
import { getStory, listStories, storyVoice } from "@/lib/stories";
import { shareMetadata } from "@/lib/share";

export const dynamicParams = false;

export function generateStaticParams() {
  return listStories().map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/stories/[slug]">) {
  const { slug } = await params;
  const story = getStory(slug);
  return story
    ? shareMetadata(story.title, story.dek)
    : { title: "Story" };
}

export default async function StoryArticlePage({
  params,
}: PageProps<"/stories/[slug]">) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) {
    notFound();
  }
  const voice = storyVoice(story);
  const all = listStories();
  const index = all.findIndex((item) => item.slug === story.slug);
  // Next newer story; the latest story points at the one before it instead of itself.
  const next = index > 0 ? all[index - 1] : all[1];
  const nextVoice = next ? storyVoice(next) : undefined;
  const more = all.filter((item) => item.slug !== story.slug && item.slug !== next?.slug).slice(0, 3);

  return (
    <article className="space-y-6">
      <p className="flex min-w-0 flex-wrap items-baseline gap-x-2 font-mono text-[11px] tracking-wide uppercase">
        <Link href="/stories" className="inline-flex min-h-11 items-center text-ink-soft hover:text-masthead">
          Stories
        </Link>
        <span className="text-ink/30" aria-hidden="true">/</span>
        <span className="min-w-0 break-words">{story.title}</span>
      </p>

      <p
        data-story-kicker
        className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[13px] tracking-wide text-ink-soft uppercase"
      >
        <StoryLabel label={story.label} />
        <span aria-hidden="true">·</span>
        <time dateTime={story.date}>{story.dateLabel}</time>
      </p>

      <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight break-words sm:text-5xl">
        {story.title}
      </h1>

      {voice ? (
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/cast/${voice.slug}`}
            className="inline-flex min-h-11 items-center gap-2"
          >
            <VoiceAvatar voice={voice} size={36} className="size-9" />
            <span className="font-medium text-ink">{voice.name}</span>
          </Link>
          {story.bylineDetail ? (
            <span className="text-sm text-ink-soft">{story.bylineDetail}</span>
          ) : null}
        </div>
      ) : null}

      {story.dek ? <p className="max-w-2xl text-base leading-7 text-ink-soft">{story.dek}</p> : null}

      <StoryBody html={story.html} />

      {next ? (
        <section aria-label="Next story" className="border-t border-border pt-5">
          <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">Next story</p>
          <Link href={`/stories/${next.slug}`} className="mt-1 block max-w-3xl hover:underline">
            <span className="block font-heading text-[22px] leading-snug font-semibold break-words">{next.title}</span>
            <span className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[13px] tracking-wide text-ink-soft uppercase">
              <StoryLabel label={next.label} />
              <span>
                {nextVoice ? `${nextVoice.name} · ` : ""}
                {next.dateLabel}
              </span>
            </span>
          </Link>
          {more.length > 0 ? (
            <>
              <p className="mt-5 font-mono text-sm tracking-[0.18em] text-masthead uppercase">More stories</p>
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

      <section className="grid gap-2 border-t border-border pt-5 sm:grid-cols-2">
        <div>
          <p className="mb-2 font-mono text-sm tracking-[0.18em] text-masthead uppercase">
            Related cast
          </p>
          {voice ? (
            <Link
              href={`/cast/${voice.slug}`}
              className="flex h-full min-h-[4.5rem] items-center gap-3 border-2 border-border bg-card-loud px-4 py-3"
            >
              <VoiceAvatar voice={voice} size={40} className="size-10" />
              <span>
                <span className="block font-heading text-lg font-semibold">
                  {voice.name}
                </span>
                <span className="font-mono text-xs tracking-wide text-ink-soft uppercase">
                  {voice.title}
                </span>
              </span>
            </Link>
          ) : null}
        </div>
        {story.relatedGameHref ? (
          <div>
            <p className="mb-2 font-mono text-sm tracking-[0.18em] text-masthead uppercase">
              Related game
            </p>
            <Link
              href={story.relatedGameHref}
              className="flex h-full min-h-[4.5rem] items-center justify-between gap-3 bg-bar px-4 text-bar-foreground"
            >
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs tracking-wide uppercase">
                  {story.relatedGameLabel ?? "Melbourne game →"}
                </span>
              </span>
            </Link>
          </div>
        ) : null}
      </section>
    </article>
  );
}
