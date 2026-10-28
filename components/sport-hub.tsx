import Link from "next/link";
import { CallStatusTag } from "@/components/calls-record";
import { StoryRows } from "@/components/home-sections";
import { getCallRecord, type Call, type Sport } from "@/lib/calls";
import type { Story } from "@/lib/stories";

const kicker = "font-mono text-sm tracking-[0.18em] text-masthead uppercase";
const heading = "border-b border-ink/15 pb-2 font-mono text-sm tracking-[0.18em] text-masthead uppercase";

export function SportHub({
  sport,
  intro,
  calls,
  stories,
  children,
}: {
  sport: Sport;
  intro: string;
  calls: Call[];
  stories: Story[];
  children?: React.ReactNode;
}) {
  const mine = calls.filter((call) => call.sport === sport);
  const { tally } = getCallRecord(mine);
  const sorted = [...mine].sort((a, b) => b.date.localeCompare(a.date) || b.postUrl.localeCompare(a.postUrl));
  return (
    <div className="space-y-6">
      <section className="max-w-3xl space-y-2">
        <p className={kicker}>Poor Form Desk</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{sport}</h1>
        <p className="text-sm leading-6 text-ink-soft sm:text-base">{intro}</p>
      </section>

      {children}

      <section aria-labelledby="hub-calls" className="space-y-2">
        <h2 id="hub-calls" className={heading}>Chip’s {sport} calls</h2>
        {sorted.length === 0 ? (
          <p className="text-sm text-ink-soft">No {sport} calls on the record yet.</p>
        ) : (
          <>
            <p data-hub-record className="font-mono text-[13px] tracking-wide text-ink-soft uppercase">
              {sport} record {tally.hits}–{tally.misses} · {tally.stillArguing} still arguing · {tally.pending} pending
            </p>
            <ul className="divide-y divide-ink/15">
              {sorted.map((call) => (
                <li key={call.postUrl} className="grid gap-x-4 gap-y-1 py-3 sm:grid-cols-[1fr_auto] sm:items-start">
                  <div className="min-w-0">
                    <p className="font-mono text-[13px] tracking-wide text-ink-soft uppercase">
                      <time dateTime={call.date}>{call.dateLabel}</time>
                      {call.window ? ` · ${call.window}` : ""} · {call.game}
                    </p>
                    <p className="font-heading text-lg leading-snug font-semibold break-words">{call.take}</p>
                    <a href={call.postUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-mono text-sm tracking-wide text-masthead uppercase underline-offset-4 hover:underline">
                      The X post
                    </a>
                  </div>
                  <div className="sm:text-right"><CallStatusTag status={call.status} /></div>
                </li>
              ))}
            </ul>
          </>
        )}
        <Link href="/calls" className="inline-flex min-h-11 items-center font-mono text-sm tracking-wide text-masthead uppercase underline-offset-4 hover:underline">
          All calls →
        </Link>
      </section>

      <section aria-labelledby="hub-stories" className="space-y-2">
        <h2 id="hub-stories" className={heading}>{sport} stories</h2>
        <StoryRows stories={stories.filter((story) => story.sport === sport)} empty={`No ${sport} stories yet.`} />
      </section>
    </div>
  );
}
