import Link from "next/link";
import { StaffLink } from "@/components/staff-link";
import { StoryLabel } from "@/components/story-label";
import { VoiceAvatar } from "@/components/voice-avatar";
import { storyVoice, type Story } from "@/lib/stories";

export function StoryCard({
  story,
  featured = false,
}: {
  story: Story;
  featured?: boolean;
}) {
  const voice = storyVoice(story);

  return (
    <div className="relative block min-w-0 border-2 border-border bg-card-loud">
      <article
        className={`border-l-[6px] border-masthead px-4 py-3 sm:px-5 sm:py-4 ${featured ? "sm:py-6" : ""}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex flex-wrap items-center gap-2 font-mono text-sm tracking-wide text-masthead uppercase">
            <StoryLabel label={story.label} />
            {featured ? "Featured column" : "Column"}
          </p>
          <p className="font-mono text-[13px] tracking-wide text-ink-soft uppercase">
            {story.dateLabel}
          </p>
        </div>
        <h2
          className={`mt-2 font-heading font-semibold tracking-tight break-words ${featured ? "text-3xl sm:text-4xl" : "text-2xl sm:text-[28px]"}`}
        >
          <Link href={`/stories/${story.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {story.title}
          </Link>
        </h2>
        {story.dek ? (
          <p className={`mt-1 leading-6 text-ink-soft ${featured ? "max-w-3xl text-base" : "text-sm"}`}>
            {story.dek}
          </p>
        ) : null}
        {voice ? (
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <VoiceAvatar voice={voice} size={28} className="size-7" />
            <StaffLink slug={voice.slug} raised className="font-medium text-ink">{voice.name}</StaffLink>
            {story.bylineDetail ? (
              <span className="text-ink-soft">· {story.bylineDetail}</span>
            ) : null}
            <span className="font-mono text-xs tracking-wide text-ink-soft uppercase">
              Cast
            </span>
          </p>
        ) : null}
      </article>
    </div>
  );
}

export function StoriesStrip({ stories }: { stories: Story[] }) {
  const [featured, ...rest] = stories;
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">
            Poor Form Desk
          </p>
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Stories
          </h2>
        </div>
        <Link
          href="/stories"
          className="inline-flex min-h-11 items-center font-mono text-sm tracking-wide text-masthead uppercase underline-offset-4 hover:underline"
        >
          All stories
        </Link>
      </div>
      {featured ? <StoryCard story={featured} featured /> : null}
      {rest.length > 0 ? (
        <ul className="grid gap-2 md:grid-cols-2">
          {rest.map((story) => (
            <li key={story.slug}>
              <StoryCard story={story} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
