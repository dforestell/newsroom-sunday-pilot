import Link from "next/link";
import { CallStatusTag } from "@/components/calls-record";
import { PublishingRhythm } from "@/components/publishing-rhythm";
import { getCallRecord, type Call, type CallRecord } from "@/lib/calls";

function RecordLine({ record }: { record: CallRecord }) {
  const tally = record.tally as CallRecord["tally"] & { stillArguing?: number };
  return (
    <p className="font-mono text-sm tracking-wide uppercase">
      <span className="sr-only">Chip’s record: </span>
      Record <span>{tally.hits}</span>–<span>{tally.misses}</span>
      {tally.stillArguing ? <> · <span>{tally.stillArguing}</span> Still arguing</> : null}
      {" · "}
      <span>{tally.pending}</span> Pending
      <span className="text-ink-soft"> · {record.streak.label}</span>
    </p>
  );
}

function PostLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center font-mono text-[11px] tracking-wide text-masthead uppercase underline-offset-4 hover:underline"
    >
      The X post
    </a>
  );
}

export function CallsList({ calls }: { calls: Call[] }) {
  const record = getCallRecord(calls);
  const next = record.next;
  const past = calls.filter((call) => call !== next);
  return (
    <div className="space-y-6">
      <section className="max-w-3xl space-y-2">
        <p className="font-mono text-[11px] tracking-[0.18em] text-masthead uppercase">
          <Link
            href="/cast/chip-absolute"
            className="relative inline-flex items-center underline-offset-4 after:absolute after:-inset-x-1 after:-inset-y-3 after:content-[''] hover:underline"
          >
            Chip Absolute
          </Link>
        </p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          Chip’s calls
        </h1>
        <p className="text-sm leading-6 text-ink-soft sm:text-base">
          His takes, and how each one held up.
        </p>
        <p className="text-sm leading-6 text-ink-soft sm:text-base">
          Forecasts are locked before kickoff and graded by the final ESPN box. They hit only if they happen exactly as written. Arguments aren’t graded hit or miss; Chip either owns them or they stand, with the evidence in the receipt.
        </p>
        <p className="text-sm italic text-ink-soft">
          Fictional columnist. Football satire, not reporting.
        </p>
      </section>

      <section aria-label="Next call" className="border-2 border-border bg-card-loud px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[11px] tracking-[0.18em] text-masthead uppercase">Next call</p>
          {next ? <CallStatusTag status={next.status} /> : null}
        </div>
        {next ? (
          <>
            <p className="mt-2 font-mono text-[11px] tracking-wide text-ink-soft uppercase">
              <time dateTime={next.date}>{next.dateLabel}</time>
              {next.window ? ` · ${next.window}` : ""}
            </p>
            <p className="mt-1 font-mono text-[11px] tracking-[0.18em] text-masthead uppercase">{next.game}</p>
            <p className="mt-1 font-heading text-2xl font-semibold tracking-tight break-words sm:text-3xl">{next.take}</p>
            <PostLink href={next.postUrl} />
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-soft">Next call drops soon.</p>
        )}
      </section>

      <RecordLine record={record} />

      <PublishingRhythm />

      <section aria-labelledby="past-calls" className="space-y-2">
        <h2 id="past-calls" className="border-b border-ink/15 pb-2 font-mono text-[11px] tracking-[0.18em] text-masthead uppercase">
          Past calls
        </h2>
        {past.length === 0 ? (
          <p className="text-sm text-ink-soft">No calls filed.</p>
        ) : (
          <ul className="divide-y divide-ink/15">
            {past.map((call) => (
              <li key={call.postUrl} className="grid gap-x-4 gap-y-1 py-3 sm:grid-cols-[9rem_1fr_auto] sm:items-start">
                <p className="font-mono text-[11px] tracking-wide text-ink-soft uppercase">
                  <time dateTime={call.date}>{call.dateLabel}</time>
                  {call.window ? ` · ${call.window}` : ""}
                </p>
                <div className="min-w-0">
                  <p className="font-mono text-[11px] tracking-[0.18em] text-masthead uppercase">
                    {call === record.latest ? "Latest call · " : ""}
                    {call.game}
                  </p>
                  <p className="font-heading text-lg leading-snug font-semibold break-words">{call.take}</p>
                  {call.result ? <p className="mt-1 text-sm leading-6 text-ink">{call.result}</p> : null}
                  {call.note ? <p className="mt-1 text-sm leading-6 text-ink-soft italic">{call.note}</p> : null}
                  <PostLink href={call.postUrl} />
                </div>
                <div className="sm:text-right">
                  <CallStatusTag status={call.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
