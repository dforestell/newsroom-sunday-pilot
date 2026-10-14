import Link from "next/link";
import { VoiceAvatar } from "@/components/voice-avatar";
import { CAST } from "@/lib/cast";
import { shareMetadata } from "@/lib/share";

export const metadata = shareMetadata(
  "Cast",
  "Meet the Poor Form Desk: six named voices and the house Desk.",
);

export default function CastIndexPage() {
  return (
    <div className="space-y-6">
      <section className="max-w-3xl space-y-2">
        <p className="font-mono text-[11px] tracking-[0.18em] text-masthead uppercase">
          Poor Form Desk
        </p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          Cast
        </h1>
        <p className="text-sm leading-6 text-ink-soft sm:text-base">
          Six named voices plus the house Desk. Chip Absolute leads. Desk lines
          on the timelines are shown with byline. Poor Form Desk holds the house stamp.
        </p>
      </section>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CAST.map((voice) => (
          <li key={voice.slug} className="flex min-w-0 flex-col gap-2 border border-border bg-card px-4 py-4">
            <VoiceAvatar voice={voice} size={64} className="size-16" />
            <h2 className="font-heading text-xl font-semibold tracking-tight break-words">
              <Link href={`/cast/${voice.slug}`} className="underline-offset-4 hover:underline">
                {voice.name}
              </Link>
            </h2>
            <p className="font-mono text-[11px] tracking-wide text-ink-soft uppercase">
              {voice.desk} · {voice.title}
            </p>
            <p className="text-sm leading-6 text-ink-soft">{voice.lens}</p>
            <p className="flex min-w-0 flex-wrap gap-x-4 text-sm">
              {voice.x ? (
                <a
                  href={voice.x.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center break-all text-masthead underline-offset-4 hover:underline"
                >
                  @{voice.x.handle} on X
                </a>
              ) : (
                <span className="inline-flex min-h-11 items-center text-ink-soft">X account coming soon</span>
              )}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
