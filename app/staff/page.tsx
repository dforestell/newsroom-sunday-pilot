import Link from "next/link";
import { VoiceAvatar } from "@/components/voice-avatar";
import { ACTIVE_CAST } from "@/lib/cast";
import { shareMetadata } from "@/lib/share";

export const metadata = shareMetadata("Cast", "Meet the Poor Form Desk cast.");

// Names only: titles are never shown. Hidden (inactive) voices are not listed.
export default function StaffIndexPage() {
  return (
    <div className="space-y-6">
      <section className="max-w-3xl space-y-2">
        <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">Poor Form Desk</p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">Cast</h1>
        <p className="text-sm leading-6 text-ink-soft sm:text-base">Chip Absolute leads. Poor Form Desk holds the house stamp.</p>
      </section>
      <ul data-staff-index className="grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-2 sm:gap-4 sm:divide-y-0 sm:border-y-0 lg:grid-cols-4">
        {ACTIVE_CAST.map((voice) => (
          <li key={voice.slug} className="flex min-w-0 flex-row items-start gap-3 py-3 sm:flex-col sm:gap-2 sm:border sm:border-border sm:bg-card sm:px-4 sm:py-4">
            <VoiceAvatar voice={voice} size={64} className="size-12 shrink-0 sm:size-16" />
            <div className="flex min-w-0 flex-col gap-1 sm:gap-2">
              <h2 className="font-heading text-xl font-semibold tracking-tight break-words">
                <Link href={`/staff/${voice.slug}`} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
                  {voice.name}
                </Link>
              </h2>
              <p className="text-sm leading-6 text-ink-soft">{voice.lens}</p>
              {voice.x ? (
                <a href={voice.x.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center break-all text-sm text-masthead underline-offset-4 hover:underline">
                  @{voice.x.handle} on X
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
