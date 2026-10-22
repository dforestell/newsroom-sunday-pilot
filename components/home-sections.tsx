import { SportChip } from "@/components/sport-chip";
import { StaffLink } from "@/components/staff-link";
import Link from "next/link";
import { StoryLabel } from "@/components/story-label";
import { VoiceAvatar } from "@/components/voice-avatar";
import { CAST } from "@/lib/cast";
import { getCallRecord, type Call } from "@/lib/calls";
import { storyVoice, type Story } from "@/lib/stories";

const kicker = "font-mono text-sm tracking-[0.18em] text-masthead uppercase";
const sectionLink =
  "inline-flex min-h-11 items-center font-mono text-sm tracking-wide text-masthead uppercase underline-offset-4 hover:underline";

function SectionHead({ label, title, href, linkLabel }: { label: string; title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2 border-t border-ink/15 pt-4">
      <div>
        <p className={kicker}>{label}</p>
        <h2 className="font-heading text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      <Link href={href} className={sectionLink}>
        {linkLabel}
      </Link>
    </div>
  );
}

export function HomeFeatured({ story, calls }: { story: Story | undefined; calls: Call[] }) {
  const record = getCallRecord(calls);
  const call = record.next ?? record.latest;
  const voice = story ? storyVoice(story) : undefined;
  return (
    <section aria-label="Featured" className="grid border-2 border-border bg-card-loud lg:grid-cols-[3fr_2fr]">
      {story ? (
        <div className="relative block min-w-0 px-4 py-4 sm:px-5">
          <p className={`${kicker} flex flex-wrap items-center gap-2`}>
            <StoryLabel label={story.label} />
            <span>Latest column · {story.dateLabel}</span>
          </p>
          <h2 className="mt-2 font-heading text-[28px] leading-tight font-semibold tracking-tight break-words">
            <Link href={`/stories/${story.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {story.title}
            </Link>
          </h2>
          {story.dek ? <p className="mt-2 text-sm leading-6 text-ink-soft">{story.dek}</p> : null}
          {voice ? (
            <p className="mt-3 flex items-center gap-2 text-sm">
              <VoiceAvatar voice={voice} size={28} className="size-7" />
              <StaffLink slug={voice.slug} raised className="font-medium">{voice.name}</StaffLink>
              {story.bylineDetail ? <span className="text-ink-soft">· {story.bylineDetail}</span> : null}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="min-w-0 border-t border-ink/15 px-4 py-4 sm:px-5 lg:border-t-0 lg:border-l">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={kicker}>Chip’s call{call?.status === "pending" ? "" : " · latest"}</p>
        </div>
        {call ? (
          <figure className="mt-2">
            <blockquote className="border-l-4 border-satire pl-3 font-heading text-xl leading-snug font-semibold italic break-words">
              “{call.take}”
            </blockquote>
            <figcaption className="mt-2 font-mono text-[13px] tracking-wide text-ink-soft uppercase">
              <span className="inline-flex flex-wrap items-center gap-2">
                <SportChip sport={call.sport} />
                <span>
                  {call.game} · <time dateTime={call.date}>{call.dateLabel}</time>
                </span>
              </span>
            </figcaption>
          </figure>
        ) : (
          <p className="mt-2 text-sm text-ink-soft">Next call drops soon.</p>
        )}
        <Link href="/calls" className={sectionLink}>
          All calls →
        </Link>
      </div>
    </section>
  );
}

export function HomeCast() {
  return (
    <section className="space-y-2">
      <SectionHead label="Poor Form Desk" title="Cast" href="/cast" linkLabel="Full cast →" />
      <ul className="grid grid-cols-2 gap-x-4 sm:grid-cols-3 lg:grid-cols-4">
        {CAST.map((voice) => (
          <li key={voice.slug}>
            <Link href={`/staff/${voice.slug}`} className="flex min-h-12 min-w-0 items-center gap-2 py-1 hover:underline">
              <VoiceAvatar voice={voice} size={32} className="size-8 shrink-0" />
              <span className="min-w-0">
                <span className="block truncate font-heading text-sm font-semibold">{voice.name}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HomeStories({ stories, filter }: { stories: Story[]; filter?: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <SectionHead label="Poor Form Desk" title="Stories" href="/stories" linkLabel="All stories →" />
      {filter ?? <StoryRows stories={stories} />}
    </section>
  );
}

export function StoryRows({ stories, empty = "No stories filed yet." }: { stories: Story[]; empty?: string }) {
  if (stories.length === 0) return <p className="py-3 text-sm text-ink-soft">{empty}</p>;
  return (
      <ul className="divide-y divide-ink/15">
        {stories.map((story) => {
          const voice = storyVoice(story);
          return (
            <li key={story.slug}>
              <div className="relative py-3">
                <Link href={`/stories/${story.slug}`} className="block font-heading text-lg leading-snug font-semibold hover:underline after:absolute after:inset-0 after:content-['']">{story.title}</Link>
                <span className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[13px] tracking-wide text-ink-soft uppercase">
                  <StoryLabel label={story.label} />
                  <span>
                    {voice ? (
                      <>
                        <StaffLink slug={voice.slug} raised>{voice.name}</StaffLink>
                        {" · "}
                      </>
                    ) : null}
                    {story.dateLabel}
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
  );
}
