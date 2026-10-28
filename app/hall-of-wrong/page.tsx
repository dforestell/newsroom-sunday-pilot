import { CallStatusTag } from "@/components/calls-record";
import { listPublicCalls } from "@/lib/calls";
import { HALL_RESEARCH, type HallSource } from "@/lib/hall/research";
import { shareMetadata } from "@/lib/share";

export const revalidate = 30;

export const metadata = shareMetadata("Hall of Wrong", "Preseason takes that are already done, and every call Chip missed. Sources attached.");

const kicker = "font-mono text-sm tracking-[0.18em] text-masthead uppercase";
const heading = "border-b border-ink/15 pb-2 font-mono text-sm tracking-[0.18em] text-masthead uppercase";
const linkClass = "inline-flex min-h-11 items-center font-mono text-sm tracking-wide text-masthead uppercase underline-offset-4 hover:underline";

function Sources({ sources }: { sources: HallSource[] }) {
  return (
    <p className="flex flex-wrap gap-x-4">
      {sources.map((source) => (
        <a key={source.url + source.label} href={source.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {source.label}
        </a>
      ))}
    </p>
  );
}

export default async function HallOfWrong() {
  const all = await listPublicCalls();
  const held = all.filter((call) => call.status === "held-up").sort((a, b) => b.date.localeCompare(a.date) || b.postUrl.localeCompare(a.postUrl));
  const missed = all
    .filter((call) => call.status === "missed")
    .sort((a, b) => b.date.localeCompare(a.date) || b.postUrl.localeCompare(a.postUrl));
  return (
    <div className="space-y-6">
      <section className="max-w-3xl space-y-2">
        <p className={kicker}>Poor Form Desk</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Hall of Wrong</h1>
        <p className="text-sm leading-6 text-ink-soft sm:text-base">
          Takes that are already done, not just trending badly. We frame the take, not the person who made it. Every plaque has a receipt.
        </p>
      </section>

      <section aria-labelledby="hall-preseason" className="space-y-2">
        <h2 id="hall-preseason" className={heading}>Preseason takes, already settled</h2>
        <ol className="divide-y divide-ink/15">
          {HALL_RESEARCH.map((entry) => (
            <li key={entry.id} data-hall-entry className="py-3">
              <p className="font-mono text-[13px] tracking-wide text-ink-soft uppercase">{entry.sport}</p>
              <p className="font-heading text-lg leading-snug font-semibold break-words">{entry.take}</p>
              <p className="mt-1 text-sm leading-6 text-ink-soft">{entry.credit}</p>
              <p className="mt-1 text-sm leading-6"><span className="font-semibold">How it ended: </span>{entry.verdict}</p>
              {entry.note ? <p className="mt-1 text-sm leading-6 text-ink-soft italic">{entry.note}</p> : null}
              <Sources sources={entry.sources} />
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="hall-chip" className="space-y-2">
        <h2 id="hall-chip" className={heading}>Chip’s own wing</h2>
        <p className="text-sm leading-6 text-ink-soft">Chip’s missed calls hang here too, each with the original post.</p>
        {missed.length === 0 ? (
          <p className="text-sm text-ink-soft">No missed calls on the record.</p>
        ) : (
          <ol className="divide-y divide-ink/15">
            {missed.map((call) => (
              <li key={call.postUrl} data-hall-entry className="grid gap-x-4 py-3 sm:grid-cols-[1fr_auto] sm:items-start">
                <div className="min-w-0">
                  <p className="font-mono text-[13px] tracking-wide text-ink-soft uppercase">
                    {call.sport} · <time dateTime={call.date}>{call.dateLabel}</time> · {call.game}
                  </p>
                  <p className="font-heading text-lg leading-snug font-semibold break-words">{call.take}</p>
                  {call.result ? <p className="mt-1 text-sm leading-6">{call.result}</p> : null}
                  <Sources sources={[{ label: "The X post", url: call.postUrl }, ...(call.receiptUrl ? [{ label: "The receipt", url: call.receiptUrl }] : [])]} />
                </div>
                <div className="sm:text-right"><CallStatusTag status={call.status} /></div>
              </li>
            ))}
          </ol>
        )}
        {held.length > 0 ? (
          <details data-hall-also-hit className="border-t border-ink/15 pt-2">
            <summary className="inline-flex min-h-11 cursor-pointer items-center font-mono text-sm tracking-wide text-ink-soft uppercase">Also hit ({held.length})</summary>
            <ol className="divide-y divide-ink/15">
              {held.map((call) => (
                <li key={call.postUrl} className="grid gap-x-4 py-3 sm:grid-cols-[1fr_auto] sm:items-start">
                  <div className="min-w-0">
                    <p className="font-mono text-[13px] tracking-wide text-ink-soft uppercase">
                      {call.sport} · <time dateTime={call.date}>{call.dateLabel}</time> · {call.game}
                    </p>
                    <p className="font-heading text-base leading-snug font-semibold break-words">{call.take}</p>
                    <Sources sources={[{ label: "The X post", url: call.postUrl }]} />
                  </div>
                  <div className="sm:text-right"><CallStatusTag status={call.status} /></div>
                </li>
              ))}
            </ol>
          </details>
        ) : null}
      </section>
    </div>
  );
}
