import Link from "next/link";
import { DeskPill } from "@/components/desk-pill";
import {
  CALL_STATUS_LABEL,
  CALL_STATUS_TONE,
  UNGRADED_NOTE,
  getCallRecord,
  type Call,
  type CallRecord,
  type CallStatus,
  type CallStreak,
} from "@/lib/calls";

const tallyRows: Array<{ key: "hits" | "misses" | "stillArguing" | "pending"; label: string }> = [
  { key: "hits", label: "Held up" },
  { key: "misses", label: "Missed" },
  { key: "stillArguing", label: "Still arguing" },
  { key: "pending", label: "Pending" },
];

function streakTone(streak: CallStreak): "live" | "warn" | "outline" {
  if (streak.kind === "hot") return "live";
  if (streak.kind === "cold") return "warn";
  return "outline";
}

export function CallStatusTag({ status }: { status: CallStatus }) {
  const pill = <DeskPill tone={CALL_STATUS_TONE[status]}>{CALL_STATUS_LABEL[status]}</DeskPill>;
  if (status !== "ungraded") return pill;
  return (
    <span className="inline-flex flex-col gap-1 sm:items-end">
      {pill}
      <span className="text-sm leading-6 text-ink-soft italic">{UNGRADED_NOTE}</span>
    </span>
  );
}

function PostLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 inline-flex min-h-11 items-center font-mono text-sm tracking-wide text-masthead uppercase underline-offset-4 hover:underline"
    >
      The X post
    </a>
  );
}

export function NextCall({ call }: { call: Call | null }) {
  return (
    <section aria-label="Next call" className="border border-border bg-card">
      <div className="border-l-[6px] border-masthead px-4 py-3 sm:px-5 sm:py-4">
        <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">
          Next call
        </p>
        {call ? (
          <>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-[13px] tracking-wide text-ink-soft uppercase">
                <time dateTime={call.date}>{call.dateLabel}</time>
                {call.window ? ` · ${call.window}` : ""}
              </p>
              <CallStatusTag status={call.status} />
            </div>
            <p className="mt-2 font-mono text-sm tracking-[0.18em] text-masthead uppercase">
              {call.game}
            </p>
            <p className="mt-1 font-heading text-xl font-semibold tracking-tight break-words sm:text-2xl">
              {call.take}
            </p>
            <PostLink href={call.postUrl} />
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-soft">Next call drops soon.</p>
        )}
      </div>
    </section>
  );
}

export function ChipRecord({
  record,
  showLatest = false,
}: {
  record: CallRecord;
  showLatest?: boolean;
}) {
  return (
    <section aria-label="Chip’s record" className="border border-border bg-card">
      <div className="border-l-[6px] border-masthead px-4 py-3 sm:px-5 sm:py-4">
        <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">
          Chip’s record
        </p>
        <ul
          aria-label="Call tally"
          className="mt-3 grid grid-cols-2 gap-px sm:grid-cols-4 border border-border bg-border"
        >
          {tallyRows.map((row) => (
            <li key={row.key} className="bg-card px-2 py-3 text-center sm:px-4">
              <p className="font-heading text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
                {record.tally[row.key]}
              </p>
              <p className="mt-1 font-mono text-xs leading-tight tracking-wide text-ink-soft uppercase sm:text-[13px]">
                {row.label}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-3">
          <DeskPill tone={streakTone(record.streak)} className="h-auto min-h-5 max-w-full py-1 text-left leading-4 whitespace-normal">
            {record.streak.label}
          </DeskPill>
        </p>
        {showLatest && record.latest ? (
          <div className="mt-4 border-t border-border pt-3">
            <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">
              Latest call
            </p>
            <div className="mt-2 bg-card-loud px-3 py-3 sm:px-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-[13px] tracking-wide text-ink-soft uppercase">
                  <time dateTime={record.latest.date}>{record.latest.dateLabel}</time>
                  {record.latest.window ? ` · ${record.latest.window}` : ""}
                </p>
                <CallStatusTag status={record.latest.status} />
              </div>
              <p className="mt-2 font-mono text-sm tracking-[0.18em] text-masthead uppercase">
                {record.latest.game}
              </p>
              <p className="mt-1 font-heading text-xl font-semibold tracking-tight break-words sm:text-2xl">
                {record.latest.take}
              </p>
              <PostLink href={record.latest.postUrl} />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function CallsDesk({
  calls,
  showLatest = false,
}: {
  calls: Call[];
  showLatest?: boolean;
}) {
  const record = getCallRecord(calls);
  return (
    <div className="grid items-start gap-3 lg:grid-cols-2">
      <NextCall call={record.next} />
      <ChipRecord record={record} showLatest={showLatest} />
    </div>
  );
}

export function CallsFeature({ calls }: { calls: Call[] }) {
  return (
    <section aria-labelledby="calls-feature-heading" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">
            Chip Absolute
          </p>
          <h2 id="calls-feature-heading" className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            Chip’s calls
          </h2>
        </div>
        <Link
          href="/calls"
          className="inline-flex min-h-11 items-center font-mono text-sm tracking-wide text-masthead uppercase underline-offset-4 hover:underline"
        >
          All calls
        </Link>
      </div>
      <CallsDesk calls={calls} />
    </section>
  );
}
