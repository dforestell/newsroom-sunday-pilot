import { getCallRecord, listPublicCalls } from "@/lib/calls";
import { SITE_URL } from "@/lib/site";

// Running records strip under the header. Chip's numbers use the same calls data and
// record function as /calls. Nora and Benny have no logged picks yet (preview picks don't count).
export async function ChipTicker() {
  const { tally } = getCallRecord(await listPublicCalls());
  const label = `Chip’s record: ${tally.hits} held up, ${tally.misses} missed, ${tally.stillArguing} still arguing, ${tally.pending} pending. See all calls.`;
  return (
    <div data-record-strip className="bg-bar text-bar-foreground">
      <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-wrap items-center gap-x-4 gap-y-1 px-4 py-1.5 font-mono text-[12px] leading-5 tracking-wide uppercase sm:px-6">
        <a href={`${SITE_URL}/calls`} aria-label={label} data-chip-ticker className="inline-flex min-h-8 items-center gap-x-2 hover:underline">
          <span className="font-semibold">Chip</span>
          <span data-ticker-record className="font-semibold tabular-nums">{tally.hits}–{tally.misses}</span>
          <span className="text-demo tabular-nums">
            <span data-ticker-arguing>{tally.stillArguing}</span> arguing · <span data-ticker-pending>{tally.pending}</span> pending
          </span>
        </a>
        <a href={`${SITE_URL}/staff/benny-faithful`} className="inline-flex min-h-8 items-center gap-x-2 hover:underline">
          <span className="font-semibold">Benny</span><span className="tabular-nums">0–0</span>
        </a>
        <a href={`${SITE_URL}/staff/nora-median`} className="inline-flex min-h-8 items-center gap-x-2 hover:underline">
          <span className="font-semibold">Nora</span><span className="tabular-nums">0–0</span>
        </a>
      </div>
    </div>
  );
}
