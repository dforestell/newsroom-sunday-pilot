import Link from "next/link";
import { voiceDisplayName } from "@/lib/cast";
import { getPublicLiveBlog } from "@/lib/live/public";

const picks = [
  ["sunday-pilot", "demo-q1-pineiro-20", "chip-absolute"],
  ["sunday-pilot", "demo-q4-deebo-td", "chip-absolute"],
  ["sunday-pilot", "demo-ht-travel", "layover-len"],
  ["sunday-pilot", "demo-ht-travel", "boo-atlas"],
  ["demo-den-kc-mnf", "demo-den-kc-walker-60", "wes-process"],
  ["demo-den-kc-mnf", "demo-den-kc-walker-60", "postcard-pete"],
  ["demo-den-kc-mnf", "demo-den-kc-swift-cruise", "chyron-carl"],
  ["demo-dal-nyg-snf", "demo-dal-nyg-likely-td1", "chip-absolute"],
] as const;

export function BestOfDemo() {
  const lines = picks.flatMap(([gameId, entryId, voiceId]) => {
    const entry = getPublicLiveBlog(gameId).find((item) => item.id === entryId);
    const line = entry?.satire?.find((item) => item.voiceId === voiceId);
    return entry && line ? [{ gameId, entry, line }] : [];
  });
  return (
    <section className="space-y-3 border-t border-border pt-5">
      <h2 className="font-heading text-xl font-semibold tracking-tight">Best of the Desk</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {lines.map(({ gameId, entry, line }) => (
          <li key={`${entry.id}-${line.voiceId}`} className="border border-border bg-card px-4 py-3">
            <p className="font-heading text-base leading-6 break-words italic">“{line.line}”</p>
            <Link href={`/games/${gameId}#${entry.id}`} className="mt-1 inline-flex min-h-11 items-center font-mono text-sm tracking-wide text-masthead uppercase underline-offset-4 hover:underline">
              {voiceDisplayName(line.voiceId, line.voiceName)} · open moment
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
