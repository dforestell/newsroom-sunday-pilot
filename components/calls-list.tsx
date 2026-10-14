import Link from "next/link";
import { CallStatusTag, CallsDesk } from "@/components/calls-record";
import type { Call } from "@/lib/calls";

export function CallsList({ calls }: { calls: Call[] }) {
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

      <CallsDesk calls={calls} showLatest />

      {calls.length === 0 ? (
        <p className="text-sm text-ink-soft">No calls filed.</p>
      ) : (
        <ul className="space-y-3">
          {calls.map((call) => (
            <li key={call.postUrl}>
              <article className="border border-border bg-card">
                <div className="border-l-[6px] border-masthead px-4 py-3 sm:px-5 sm:py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono text-[11px] tracking-wide text-ink-soft uppercase">
                      <time dateTime={call.date}>{call.dateLabel}</time>
                      {call.window ? ` · ${call.window}` : ""}
                    </p>
                    <CallStatusTag status={call.status} />
                  </div>
                  <p className="mt-2 font-mono text-[11px] tracking-[0.18em] text-masthead uppercase">
                    {call.game}
                  </p>
                  <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight break-words">
                    {call.take}
                  </h2>
                  {call.result ? (
                    <p className="mt-3 text-sm leading-6 text-ink">
                      <span className="font-mono text-[11px] tracking-wide text-ink-soft uppercase">
                        Result
                      </span>
                      {" · "}
                      {call.result}
                    </p>
                  ) : null}
                  {call.note ? (
                    <p className="mt-2 text-sm leading-6 text-ink-soft italic">{call.note}</p>
                  ) : null}
                  <a
                    href={call.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex min-h-11 items-center font-mono text-[11px] tracking-wide text-masthead uppercase underline-offset-4 hover:underline"
                  >
                    The X post
                  </a>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
