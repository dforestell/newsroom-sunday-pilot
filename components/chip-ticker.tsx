import { getCallRecord, listPublicCalls } from "@/lib/calls";
import { PERSONA_THEMES } from "@/lib/staff/themes";
import { SITE_URL } from "@/lib/site";

// Chip's running record for the site chrome. Same calls data (listPublicCalls) and the
// same record function (getCallRecord) as /calls, so the numbers cannot drift.
const chip = PERSONA_THEMES["chip-absolute"].tokens;

export async function ChipTicker() {
  const { tally } = getCallRecord(await listPublicCalls());
  const label = `Chip’s record: ${tally.hits} held up, ${tally.misses} missed, ${tally.stillArguing} still arguing, ${tally.pending} pending. See all calls.`;
  return (
    <div className="border-b border-border bg-paper">
      <div className="mx-auto flex w-full max-w-5xl min-w-0 justify-end px-4 py-1.5 sm:px-6">
        <a
          href={`${SITE_URL}/calls`}
          aria-label={label}
          data-chip-ticker
          className="inline-flex max-w-full min-h-8 flex-wrap items-center gap-x-2 rounded-sm border-l-4 px-2.5 py-1 font-mono text-[12px] leading-4 tracking-wide uppercase hover:underline"
          style={{ background: chip["--persona-header-bg"], color: chip["--persona-header-fg"], borderLeftColor: chip["--persona-accent"] }}
        >
          <span className="font-semibold">Chip</span>
          <span data-ticker-record className="font-semibold tabular-nums">{tally.hits}–{tally.misses}</span>
          <span style={{ color: chip["--persona-header-meta"] }} className="tabular-nums">
            <span data-ticker-arguing>{tally.stillArguing}</span> arguing · <span data-ticker-pending>{tally.pending}</span> pending
          </span>
        </a>
      </div>
    </div>
  );
}
