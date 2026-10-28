import { DeskPill } from "@/components/desk-pill";
import { cn } from "@/lib/utils";
import type { Story } from "@/lib/stories";

type LabelTone = "demo" | "satire";

/** Split a story's front-matter label ("SATIRE", "DEMO / SATIRE") into chips. */
export function storyLabelParts(label: Story["label"]): Array<{ text: string; tone: LabelTone }> {
  return label
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((text) => ({ text, tone: text.toLowerCase() as LabelTone }));
}

/** Chips shown on article pages and cards. None: SATIRE and DEMO chips are stripped; one quiet disclaimer stays in copy. */
export function visibleLabelParts(label: Story["label"]): Array<{ text: string; tone: LabelTone }> {
  return storyLabelParts(label).filter(() => false);
}

/** Text chips (never color-only) for the visible parts of a story's label. Renders nothing when none remain. */
export function StoryLabel({ label, className }: { label: Story["label"]; className?: string }) {
  const parts = visibleLabelParts(label);
  if (parts.length === 0) return null;
  return (
    <span
      data-story-label={label}
      className={cn("inline-flex shrink-0 items-center gap-1 align-middle", className)}
    >
      {parts.map((part) => (
        <DeskPill key={part.text} tone={part.tone} className="tracking-wide">
          {part.text}
        </DeskPill>
      ))}
    </span>
  );
}
