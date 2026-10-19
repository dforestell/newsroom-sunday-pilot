import Link from "next/link";
import { VoiceAvatar } from "@/components/voice-avatar";
import { CAST } from "@/lib/cast";
import { shareMetadata } from "@/lib/share";

export const metadata = shareMetadata(
  "Cast",
  "Meet the Poor Form Desk: six named voices and the house Desk.",
  "/cast",
);

export default function CastIndexPage() {
  return (
    <div className="space-y-6">
      <section className="max-w-3xl space-y-2">
        <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">
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
      <ul className="cast-list grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-2 sm:gap-4 sm:divide-y-0 sm:border-y-0 lg:grid-cols-3">
        {CAST.map((voice) => (
          <li key={voice.slug} className="cast-row flex min-w-0 flex-row items-start gap-3 py-3 sm:flex-col sm:gap-2 sm:border sm:border-border sm:bg-card sm:px-4 sm:py-4">
            <VoiceAvatar voice={voice} size={64} className="size-12 shrink-0 sm:size-16" />
            <div className="flex min-w-0 flex-col gap-1 sm:gap-2">
            <h2 className="font-heading text-xl font-semibold tracking-tight break-words">
              <Link href={`/cast/${voice.slug}`} className="underline-offset-4 hover:underline">
                {voice.name}
              </Link>
            </h2>
            <p className="font-mono text-[13px] tracking-wide text-ink-soft uppercase">
              {voice.desk} · {voice.title}
            </p>
            <p className="text-sm leading-6 text-ink-soft">{voice.lens}</p>
            <p className="flex min-w-0 flex-wrap gap-x-4 text-sm">
              {voice.x ? (
                <a
                  href={voice.x.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center break-all sm:min-h-11 text-masthead underline-offset-4 hover:underline"
                >
                  @{voice.x.handle} on X
                </a>
              ) : (
                <span className="inline-flex min-h-9 items-center text-ink-soft sm:min-h-11">X account coming soon</span>
              )}
            </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
