import Image from "next/image";
import type { Voice } from "@/lib/cast";
import { cn } from "@/lib/utils";

export function VoiceAvatar({
  voice,
  size,
  className,
  labelled = false,
}: {
  voice: Voice;
  size: number;
  className?: string;
  labelled?: boolean;
}) {
  if (!voice.avatar) {
    // No portrait yet: initials on the voice's mark color (white text, AA on every mark).
    return (
      <span
        role={labelled ? "img" : undefined}
        aria-label={labelled ? voice.name : undefined}
        aria-hidden={labelled ? undefined : true}
        data-avatar-initials
        className={cn("inline-flex shrink-0 items-center justify-center font-mono font-semibold text-white", className)}
        style={{ width: size, height: size, background: voice.mark, fontSize: Math.round(size * 0.34) }}
      >
        {voice.initials}
      </span>
    );
  }
  return (
    <Image
      src={voice.avatar}
      alt={labelled ? voice.name : ""}
      width={size}
      height={size}
      className={cn("bg-paper object-cover", className)}
    />
  );
}
