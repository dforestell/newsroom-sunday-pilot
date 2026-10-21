import Link from "next/link";
import { DeskPill } from "@/components/desk-pill";
import { ThisLineReaction } from "@/components/this-line-reaction";
import { voiceDisplayName } from "@/lib/cast";
import { kindLabel } from "@/lib/copy";
import { cn } from "@/lib/utils";
import type { FeedEntry } from "@/lib/types";

function clockStamp(label: string) {
  return label.replace(/\s+/, " · ");
}

export function EntryList({
  entries,
  emptyTitle,
  emptyBody,
  simulated = false,
}: {
  entries: FeedEntry[];
  emptyTitle: string;
  emptyBody: string;
  simulated?: boolean;
}) {
  if (entries.length === 0) {
    return (
      <div className="border border-dashed border-border px-4 py-10 text-center">
        <p className="font-heading text-lg font-semibold">{emptyTitle}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{emptyBody}</p>
      </div>
    );
  }

  return (
    <ol className="space-y-2">
      {entries.map((entry) => {
        const showSim = simulated || entry.path === "simulated-review";
        const showDemo = Boolean(entry.demo) && !showSim;
        const satire = entry.satire ?? [];

        return (
          <li
            key={entry.id}
            id={entry.id}
            className={cn(
              "border-2 bg-card-loud",
              showDemo && "rounded-[2px] border-border",
              showSim && "border-sim/40",
              !showDemo && !showSim && "border-border",
              entry.kind === "correction" && "border-masthead/50",
              entry.kind === "duplicate" && "opacity-70",
              entry.delayed && "border-dashed",
            )}
          >
            <div
              className={cn(
                "px-4 py-3 sm:px-5",
                showDemo && "border-l-4 border-ink",
                showSim && "border-l-4 border-sim",
              )}
            >
              <div className="flex flex-wrap items-center gap-1.5">
                {showSim ? <DeskPill tone="sim">Simulated</DeskPill> : null}
                <span className="font-mono text-[13px] tracking-wide text-ink-soft uppercase">
                  {clockStamp(entry.postedAtLabel)}
                </span>
                <span className="font-mono text-[13px] tracking-wide text-ink-soft uppercase">
                  {kindLabel(entry.kind)}
                </span>
                {entry.delayed ? <DeskPill tone="warn">Delayed</DeskPill> : null}
              </div>
              <h3 className="mt-1.5 font-heading text-base font-semibold leading-snug sm:text-lg">
                {entry.headline}
              </h3>
              <p className="mt-1 text-sm leading-6 text-ink">{entry.body}</p>
              {satire.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {satire.map((line) => (
                    <li
                      key={`${entry.id}-${line.voiceId}-${line.line}`}
                      className="border-l-4 border-satire-fill bg-satire-fill/15 px-3 py-2"
                    >
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Link
                          href={`/staff/${line.voiceId}`}
                          className="font-mono text-[11px] tracking-wide text-ink uppercase underline-offset-4 hover:underline"
                        >
                          {voiceDisplayName(line.voiceId, line.voiceName)}
                        </Link>
                      </div>
                      <p className="mt-1 font-heading text-[17px] leading-7 text-ink italic">
                        {line.line}
                      </p>
                      {showDemo ? <ThisLineReaction id={`${entry.id}-${line.voiceId}`} /> : null}
                    </li>
                  ))}
                </ul>
              ) : null}
              {entry.correctsId ? (
                <p className="mt-2 font-mono text-sm text-masthead uppercase">
                  Corrects {entry.correctsId}
                </p>
              ) : null}
              {entry.duplicateOfId ? (
                <p className="mt-2 font-mono text-[13px] text-ink-soft uppercase">
                  Duplicate of {entry.duplicateOfId}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
