import Link from "next/link";
import { VoiceAvatar } from "@/components/voice-avatar";
import { ACTIVE_CAST, LEAD_VOICE_ID } from "@/lib/cast";
import { cn } from "@/lib/utils";

export function CastStrip() {
  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">
            Poor Form Desk
          </p>
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Cast
          </h2>
        </div>
        <Link
          href="/staff"
          className="inline-flex min-h-11 items-center font-mono text-sm tracking-wide text-masthead uppercase underline-offset-4 hover:underline"
        >
          Full strip
        </Link>
      </div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7">
        {ACTIVE_CAST.map((voice) => {
          const lead = voice.slug === LEAD_VOICE_ID;
          return (
            <li key={voice.slug}>
              <Link
                href={`/staff/${voice.slug}`}
                className={cn(
                  "block h-full min-w-0 bg-card-loud px-3 py-3",
                  lead
                    ? "border-2 border-masthead"
                    : "border border-border",
                )}
              >
                <VoiceAvatar
                  voice={voice}
                  size={56}
                  className="mb-2 size-14"
                />
                <p className="font-heading text-sm font-semibold leading-tight break-words">
                  {voice.name}
                </p>
                <p className="mt-1 line-clamp-2 text-[13px] leading-4 text-ink-soft">
                  {voice.lens}
                </p>
              </Link>
              {voice.x ? (
                <a
                  href={voice.x.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center font-mono text-sm tracking-wide text-masthead uppercase underline-offset-4 hover:underline"
                >
                  @{voice.x.handle} on X
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
