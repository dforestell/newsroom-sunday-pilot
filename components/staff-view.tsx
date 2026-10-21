import Link from "next/link";
import { CallStatusTag } from "@/components/calls-record";
import { SportChip } from "@/components/sport-chip";
import { StoryLabel } from "@/components/story-label";
import type { Call } from "@/lib/calls";
import { CAST, LEAD_VOICE_ID, type Voice } from "@/lib/cast";
import { staffPath } from "@/lib/staff";
import { countLabel, staffThemeStyle, type StaffTheme } from "@/lib/staff/themes";
import type { Story } from "@/lib/stories";
import { cn } from "@/lib/utils";

// Public origin for absolute links (NEXT_PUBLIC_SITE_URL when set).
const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://poorformsports.com").replace(/\/+$/, "");
// Names only: cast titles (lib/cast.ts) are never rendered on staff pages.

const kicker = "font-mono text-[11px] font-medium tracking-[0.18em] uppercase";
const countClass = "font-mono text-[11px] font-semibold tracking-[0.12em] uppercase";

function NameLockup({ voice, theme, fontClass }: { voice: Voice; theme: StaffTheme; fontClass?: string }) {
  const base = cn("staff-header__name break-words leading-[0.95]", fontClass, theme.uppercaseName && "uppercase");
  switch (theme.header) {
    case "lead": {
      const [first, ...rest] = voice.name.split(" ");
      return (
        <h1 className={cn(base, "text-[40px] tracking-[0.01em] sm:text-[56px]")}>
          <span className="block sm:inline">{first}</span>{" "}
          <span className="staff-accent-underline block sm:inline">{rest.join(" ")}</span>
        </h1>
      );
    }
    case "blueprint":
      return <h1 className={cn(base, "text-[28px] font-semibold tracking-[-0.02em] sm:text-[40px]")}>{voice.name}</h1>;
    case "signage":
      return <h1 className={cn(base, "text-[34px] font-semibold tracking-[0.04em] sm:text-[48px]")}>{voice.name}</h1>;
    case "centered":
      return <h1 className={cn(base, "text-[38px] tracking-[0.03em] sm:text-[52px]")}>{voice.name}</h1>;
    case "lower-third":
      return (
        <h1 className={cn(base, "border-l-4 border-[var(--persona-accent)] bg-[var(--persona-header-bg)] py-1 pl-3 text-[30px] font-bold tracking-[0.02em] sm:text-[40px]")}>
          {voice.name}
        </h1>
      );
    case "postcard":
      return <h1 className={cn(base, "text-[30px] sm:text-[40px]")}>{voice.name}</h1>;
    default:
      return <h1 className={cn(base, "text-[28px] font-bold tracking-[-0.01em] sm:text-4xl")}>{voice.name}</h1>;
  }
}

function StaffHeader({ voice, theme, count, fontClass }: { voice: Voice; theme: StaffTheme; count: number; fontClass?: string }) {
  const countText = countLabel(theme.labels.count, count);
  const centered = theme.header === "centered";
  const bio = (
    <p className={cn("staff-header__meta font-heading text-[15px] leading-[1.4] italic sm:text-base", centered && "mx-auto max-w-[36ch]")}>
      {theme.bio}
    </p>
  );
  const meta =
    theme.header === "postcard" ? (
      <div className="staff-stamp flex size-12 shrink-0 items-center justify-center sm:size-16" aria-label={countText} role="img">
        <span className={cn(countClass, "text-base")} aria-hidden="true">{count}</span>
      </div>
    ) : (
      <p className={cn(countClass, "staff-header__meta")}>
        {countText}
        {voice.slug === LEAD_VOICE_ID ? (
          <>
            {" · "}
            <a href={`${PUBLIC_SITE_URL}/calls`} className="underline underline-offset-4">Public record /calls</a>
          </>
        ) : null}
      </p>
    );
  return (
    <header data-header={theme.header} className="staff-header px-4 py-4 sm:px-6 sm:py-5">
      <div className={cn("relative z-[1] flex gap-2 sm:gap-4", centered ? "flex-col items-center text-center" : "flex-col sm:flex-row sm:items-end sm:justify-between")}>
        <div className={cn("min-w-0 space-y-1.5", centered && "flex flex-col items-center")}>
          <p className={cn(kicker, "staff-header__meta")}>{theme.labels.kicker}</p>
          <NameLockup voice={voice} theme={theme} fontClass={fontClass} />
          {bio}
        </div>
        <div className={cn(theme.header === "postcard" ? "order-first self-end sm:order-none sm:self-start" : centered ? "" : "sm:text-right")}>{meta}</div>
      </div>
    </header>
  );
}

function StoryRows({ stories }: { stories: Story[] }) {
  return (
    <ul>
      {stories.map((story) => (
        <li key={story.slug} className="story-row">
          <p className="flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-wide text-ink-soft uppercase">
            <time dateTime={story.date}>{story.dateLabel}</time>
            <span aria-hidden="true">·</span>
            <StoryLabel label={story.label} />
          </p>
          <Link href={`/stories/${story.slug}`} className="story-row__title mt-1 block font-heading text-base leading-[1.25] font-semibold break-words sm:text-lg">
            {story.title}
          </Link>
          {story.dek ? <p className="mt-0.5 line-clamp-1 text-sm text-ink-soft">{story.dek}</p> : null}
        </li>
      ))}
    </ul>
  );
}

function CallRows({ calls }: { calls: Call[] }) {
  return (
    <ul>
      {calls.map((call) => (
        <li key={call.postUrl} className="story-row">
          <p className="flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-wide text-ink-soft uppercase">
            <time dateTime={call.date}>{call.dateLabel}</time>
            <span aria-hidden="true">·</span>
            <SportChip sport={call.sport} />
            <span>{call.game}</span>
            <CallStatusTag status={call.status} />
          </p>
          <Link href="/calls" className="story-row__title mt-1 block font-heading text-base leading-[1.25] font-semibold break-words sm:text-lg">
            {call.take}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Section({ id, title, sort, empty, children, isEmpty }: { id: string; title: string; sort?: string; empty: string; isEmpty: boolean; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-1">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={id} className="font-heading text-2xl font-semibold">{title}</h2>
        {sort && !isEmpty ? <p className="font-mono text-[11px] tracking-wide text-ink-soft uppercase">{sort}</p> : null}
      </div>
      {isEmpty ? <p className="story-row text-sm text-ink-soft">{empty}</p> : children}
    </section>
  );
}

function CastSwitcher({ current }: { current: string }) {
  return (
    <nav aria-label="Staff" className="staff-switcher">
      <ul className="flex h-11 items-center gap-4 overflow-x-auto font-mono text-[11px] tracking-[0.12em] whitespace-nowrap text-ink-soft uppercase">
        {CAST.map((voice) => (
          <li key={voice.slug}>
            <Link
              href={staffPath(voice.slug)}
              aria-current={voice.slug === current ? "page" : undefined}
              className="inline-flex min-h-11 items-center hover:text-ink hover:underline"
            >
              {voice.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function StaffView({
  voice,
  theme,
  stories,
  calls,
  font,
}: {
  voice: Voice;
  theme: StaffTheme;
  stories: Story[];
  calls: Call[];
  font?: { className: string; style: { fontFamily: string } };
}) {
  const lead = voice.slug === LEAD_VOICE_ID;
  const count = lead ? calls.length : stories.length;
  return (
    <div
      data-persona={voice.slug}
      data-themed={theme.specified ? "spec" : "fallback"}
      style={staffThemeStyle(theme, font?.style.fontFamily)}
      className="space-y-6"
    >
      <StaffHeader voice={voice} theme={theme} count={count} fontClass={font?.className} />
      {lead ? (
        <Section id="staff-calls" title={theme.labels.section} sort={theme.labels.sort} empty={theme.labels.empty} isEmpty={calls.length === 0}>
          <CallRows calls={calls} />
        </Section>
      ) : null}
      <Section
        id="staff-stories"
        title={lead ? `Stories by ${voice.name}` : theme.labels.section}
        sort={lead ? undefined : theme.labels.sort}
        empty={lead ? "Nothing filed yet." : theme.labels.empty}
        isEmpty={stories.length === 0}
      >
        <StoryRows stories={stories} />
      </Section>
      <p className="font-mono text-[11px] tracking-wide uppercase">
        <Link href={theme.labels.backHref} className="inline-flex min-h-11 items-center text-ink-soft hover:text-ink hover:underline">
          {theme.labels.back}
        </Link>
      </p>
      <CastSwitcher current={voice.slug} />
      <p className="text-sm italic text-ink-soft">Fictional columnist. Sports satire, not reporting.</p>
    </div>
  );
}
